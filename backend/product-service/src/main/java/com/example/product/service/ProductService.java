package com.example.product.service;

import com.example.product.dto.ProductRequest;
import com.example.product.dto.ProductResponse;
// Uklonjeno: import com.example.product.model.Brand;
// Uklonjeno: import com.example.product.repository.BrandRepository;
import com.example.product.model.Product;
import com.example.product.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    // Uklonjeno: private final BrandRepository brandRepository;

    // Kreiraj proizvod
    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest) {
        // Uklonjeno: Logika za dohvat branda
        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .quantity(productRequest.getQuantity())
                .imageUrl(productRequest.getImageUrl())
                .brand(productRequest.getBrand()) // AŽURIRANO: Sada je String
                .category(productRequest.getCategory())
                .build();
        productRepository.save(product);
        return mapToProductResponse(product);
    }

    // Dohvati sve proizvode
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    // Dohvati proizvod po ID-u
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product with ID " + id + " not found"));
        return mapToProductResponse(product);
    }

    // Ažuriraj proizvod
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product with ID " + id + " not found"));

        // Uklonjeno: Logika za dohvat branda
        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setPrice(productRequest.getPrice());
        existingProduct.setQuantity(productRequest.getQuantity());
        existingProduct.setImageUrl(productRequest.getImageUrl());
        existingProduct.setBrand(productRequest.getBrand()); // AŽURIRANO: Sada je String
        existingProduct.setCategory(productRequest.getCategory());

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToProductResponse(updatedProduct);
    }

    // Obriši proizvod
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product with ID " + id + " not found");
        }
        productRepository.deleteById(id);
    }

    // Pomoćna metoda za mapiranje entiteta u DTO
    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .brand(product.getBrand()) // AŽURIRANO: Samo brand (String)
                // Uklonjeno: .brandImageUrl(null)
                .category(product.getCategory())
                .build();
    }

    // Metoda za smanjenje količine (koristit će je OrderService)
    @Transactional
    public void decreaseProductQuantity(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product with ID " + productId + " not found."));

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product " + product.getName() + ". Available: " + product.getQuantity() + ", requested: " + quantity);
        }
        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);
    }

    // Metoda za povećanje količine (ako se narudžba otkaže npr.)
    @Transactional
    public void increaseProductQuantity(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product with ID " + productId + " not found."));
        product.setQuantity(product.getQuantity() + quantity);
        productRepository.save(product);
    }
}