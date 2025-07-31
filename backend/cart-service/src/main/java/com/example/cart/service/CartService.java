package com.example.cart.service;

import com.example.cart.dto.AddToCartRequest;
import com.example.cart.dto.CartItemResponse;
import com.example.cart.dto.CartResponse;
import com.example.cart.model.Cart;
import com.example.cart.model.CartItem;
import com.example.cart.repository.CartItemRepository;
import com.example.cart.repository.CartRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RestTemplate restTemplate;

    @Value("${product.service.url}")
    private String productServiceUrl;

    // Metoda za dobivanje košarice po userId-u. Kreira novu ako ne postoji.
    @Transactional
    public CartResponse getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userId(userId).build();
                    return cartRepository.save(newCart);
                });
        return mapToCartResponse(cart);
    }

    // Metoda za dodavanje proizvoda u košaricu
    @Transactional
    public CartResponse addProductToCart(Long userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder().userId(userId).build());

        // Poziv ProductService-u da dobijemo detalje proizvoda
        ProductResponse product = getProductDetailsFromProductService(request.getProductId());

        if (product == null) {
            throw new IllegalArgumentException("Product with ID " + request.getProductId() + " not found.");
        }

        // --- PROVJERA INVENTARA PRILIKOM DODAVANJA NOVE STAVKE ---
        if (product.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock for product " + product.getName() + ". Available: " + product.getQuantity());
        }

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId());

        if (existingCartItem.isPresent()) {
            // Ako stavka već postoji, samo ažuriraj količinu
            CartItem item = existingCartItem.get();
            int newTotalQuantity = item.getQuantity() + request.getQuantity();

            // --- DODATNA PROVJERA INVENTARA PRILIKOM AŽURIRANJA KOLIČINE U KOŠARICI ---
            if (product.getQuantity() < newTotalQuantity) {
                throw new IllegalArgumentException("Cannot add more. Insufficient stock for product " + product.getName() + ". Available: " + product.getQuantity() + ", Total in cart would be: " + newTotalQuantity);
            }

            item.setQuantity(newTotalQuantity);
            cartItemRepository.save(item);
        } else {
            // Ako stavka ne postoji, kreiraj novu
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .productId(product.getId())
                    .productName(product.getName())
                    .imageUrl(product.getImageUrl())
                    .price(product.getPrice())
                    .quantity(request.getQuantity())
                    .build();
            cart.addItem(newCartItem);
            cartRepository.save(cart);
        }

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    // Metoda za ažuriranje količine proizvoda u košarici
    @Transactional
    public CartResponse updateProductQuantity(Long userId, Long productId, Integer newQuantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for user: " + userId));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in cart."));

        // Poziv ProductService-u da dobijemo detalje proizvoda za provjeru inventara
        ProductResponse product = getProductDetailsFromProductService(productId);
        if (product == null) {
            throw new IllegalArgumentException("Product with ID " + productId + " not found in Product Service.");
        }

        if (newQuantity <= 0) {
            // Ako je količina 0 ili manja, ukloni stavku iz košarice
            cart.removeItem(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            // --- PROVJERA INVENTARA PRILIKOM AŽURIRANJA KOLIČINE ---
            if (product.getQuantity() < newQuantity) {
                throw new IllegalArgumentException("Cannot update quantity. Insufficient stock for product " + product.getName() + ". Available: " + product.getQuantity());
            }
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        }

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    // Metoda za uklanjanje proizvoda iz košarice
    @Transactional
    public void removeProductFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for user: " + userId));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in cart."));

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
    }

    // Metoda za brisanje cijele košarice
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for user: " + userId));
        cartRepository.delete(cart);
    }

    // Pomoćna metoda za dohvaćanje detalja proizvoda iz ProductService
    private ProductResponse getProductDetailsFromProductService(Long productId) {
        try {
            return restTemplate.getForObject(productServiceUrl + "/api/products/" + productId, ProductResponse.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null; // Proizvod nije pronađen
            }
            throw new RuntimeException("Error communicating with Product Service: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error while fetching product details: " + e.getMessage(), e);
        }
    }

    // Metoda za mapiranje Cart entiteta u CartResponse DTO
    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .imageUrl(item.getImageUrl())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .totalItemPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalCartPrice = itemResponses.stream()
                .map(CartItemResponse::getTotalItemPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .totalCartPrice(totalCartPrice)
                .build();
    }

    // INTERNA DTO KLASA ZA ODGOVOR OD ProductService-a
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer quantity;
        private String imageUrl;
        private String brand;
        private String category;
    }
}