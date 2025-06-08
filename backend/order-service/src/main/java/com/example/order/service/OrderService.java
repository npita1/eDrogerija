package com.example.order.service;

import com.example.order.dto.CartItemResponse;
import com.example.order.dto.CartResponse;
import com.example.order.dto.OrderResponse;
import com.example.order.dto.ProductResponse;
import com.example.order.dto.UserDetailResponse;
import com.example.order.dto.OrderItemResponse;
import com.example.order.model.Order;
import com.example.order.model.OrderItem;
import com.example.order.model.OrderStatus;
import com.example.order.repository.OrderItemRepository;
import com.example.order.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestTemplate restTemplate;

    @Value("${product.service.url}")
    private String productServiceUrl;

    @Value("${cart.service.url}")
    private String cartServiceUrl;

    @Value("${identity.service.url}")
    private String identityServiceUrl;

    @Transactional
    public OrderResponse placeOrder(Long userId) {
        log.info("Attempting to place order for user ID: {}", userId);

        CartResponse cartResponse;
        try {
            cartResponse = getCartDetailsFromCartService(userId);
        } catch (HttpClientErrorException e) {
            log.error("HTTP Client Error when calling Cart Service for user {}: Status={}, Body={}", userId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("Error from Cart Service: " + e.getStatusCode(), e);
        } catch (Exception e) {
            log.error("Unexpected error fetching cart details for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get cart details.", e);
        }

        if (cartResponse == null || cartResponse.getItems().isEmpty()) {
            log.warn("Cart is empty or not found for user ID: {}", userId);
            throw new IllegalArgumentException("Cannot place an order for an empty cart or cart not found.");
        }
        log.info("Cart details fetched for user {}. Number of items: {}", userId, cartResponse.getItems().size());

        UserDetailResponse userDetails;
        try {
            userDetails = getUserDetailsFromIdentityService(userId);
        } catch (HttpClientErrorException e) {
            log.error("HTTP Client Error when calling Identity Service for user {}: Status={}, Body={}", userId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("Error from Identity Service: " + e.getStatusCode(), e);
        } catch (Exception e) {
            log.error("Unexpected error fetching user details for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get user details.", e);
        }

        if (userDetails == null) {
            log.warn("User details not found for ID: {} in Identity Service.", userId);
            throw new EntityNotFoundException("User details not found for ID: " + userId + " in Identity Service.");
        }
        log.info("User details fetched for user {}: {} {} (Email: {}, Address: {})", userId, userDetails.getFirstName(), userDetails.getLastName(), userDetails.getEmail(), userDetails.getAddress());

        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .shippingFirstName(userDetails.getFirstName())
                .shippingLastName(userDetails.getLastName())
                .shippingAddressPhone(userDetails.getPhoneNumber())
                .shippingAddressStreet(userDetails.getAddress())
                // Obrisane linije:
                // .shippingAddressCity(null)
                // .shippingAddressPostalCode(null)
                // .shippingAddressCountry(null)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemResponse cartItem : cartResponse.getItems()) {
            ProductResponse productDetails;
            try {
                productDetails = getProductDetailsFromProductService(cartItem.getProductId());
            } catch (HttpClientErrorException e) {
                log.error("HTTP Client Error when calling Product Service for product {}: Status={}, Body={}", cartItem.getProductId(), e.getStatusCode(), e.getResponseBodyAsString(), e);
                throw new RuntimeException("Error from Product Service for product " + cartItem.getProductId() + ": " + e.getStatusCode(), e);
            } catch (Exception e) {
                log.error("Unexpected error fetching product details for product {}: {}", cartItem.getProductId(), e.getMessage(), e);
                throw new RuntimeException("Failed to get product details for " + cartItem.getProductName(), e);
            }

            if (productDetails == null || productDetails.getQuantity() < cartItem.getQuantity()) {
                log.warn("Insufficient stock for product: {}. Available: {}, Requested: {}", cartItem.getProductName(), (productDetails != null ? productDetails.getQuantity() : "N/A"), cartItem.getQuantity());
                throw new IllegalArgumentException("Insufficient stock for product: " + cartItem.getProductName() + ". Available: " + (productDetails != null ? productDetails.getQuantity() : "N/A") + ", Requested: " + cartItem.getQuantity());
            }

            try {
                restTemplate.postForEntity(
                        productServiceUrl + "/api/products/decrease-quantity/" + cartItem.getProductId() + "?quantity=" + cartItem.getQuantity(),
                        null,
                        Void.class
                );
                log.info("Successfully decreased quantity for product {}: {}", cartItem.getProductName(), cartItem.getQuantity());
            } catch (HttpClientErrorException e) {
                log.error("HTTP Client Error from Product Service (decrease) for product {}: Status={}, Body={}", cartItem.getProductId(), e.getStatusCode(), e.getResponseBodyAsString(), e);
                throw new RuntimeException("Error decreasing product quantity from Product Service: " + e.getStatusCode(), e);
            } catch (Exception e) {
                log.error("Failed to decrease product quantity for product {}: {}", cartItem.getProductId(), e.getMessage(), e);
                throw new RuntimeException("Failed to decrease product quantity.", e);
            }

            OrderItem orderItem = OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .imageUrl(cartItem.getImageUrl())
                    .unitPrice(cartItem.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();

            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalItemPrice());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        log.info("Order {} placed successfully for user {}.", savedOrder.getOrderNumber(), userId);

        try {
            restTemplate.delete(cartServiceUrl + "/api/cart/clear?userId=" + userId);
            log.info("Cart cleared successfully for user {}.", userId);
        } catch (HttpClientErrorException e) {
            log.warn("HTTP Client Error when clearing cart for user {}: Status={}, Body={}. Order already placed.", userId, e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to clear cart for user {}: {}. Order already placed.", userId, e.getMessage(), e);
        }

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order with number " + orderNumber + " not found."));
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order with number " + orderNumber + " not found."));

        if (order.getStatus().equals(OrderStatus.DELIVERED) && !newStatus.equals(OrderStatus.DELIVERED)) {
            throw new IllegalArgumentException("Cannot change status of a delivered order.");
        }

        if (newStatus.equals(OrderStatus.CANCELLED) && !order.getStatus().equals(OrderStatus.CANCELLED)) {
            log.info("Order {} is being cancelled. Attempting to return items to stock.", orderNumber);
            for (OrderItem item : order.getOrderItems()) {
                try {
                    restTemplate.postForEntity(
                            productServiceUrl + "/api/products/increase-quantity/" + item.getProductId() + "?quantity=" + item.getQuantity(),
                            null,
                            Void.class
                    );
                    log.info("Increased quantity for product {}: {}", item.getProductName(), item.getQuantity());
                } catch (HttpClientErrorException e) {
                    log.error("HTTP Client Error from Product Service (increase) for product {} during cancellation: Status={}, Body={}", item.getProductId(), e.getStatusCode(), e.getResponseBodyAsString(), e);
                } catch (Exception e) {
                    log.error("Failed to increase product quantity for product {} during order cancellation: {}", item.getProductId(), e.getMessage(), e);
                }
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}.", orderNumber, newStatus);
        return mapToOrderResponse(updatedOrder);
    }

    private CartResponse getCartDetailsFromCartService(Long userId) {
        log.debug("Calling Cart Service: {}", cartServiceUrl + "/api/cart?userId=" + userId);
        return restTemplate.getForObject(cartServiceUrl + "/api/cart?userId=" + userId, CartResponse.class);
    }

    private ProductResponse getProductDetailsFromProductService(Long productId) {
        log.debug("Calling Product Service: {}", productServiceUrl + "/api/products/" + productId);
        return restTemplate.getForObject(productServiceUrl + "/api/products/" + productId, ProductResponse.class);
    }

    private UserDetailResponse getUserDetailsFromIdentityService(Long userId) {
        log.debug("Calling Identity Service: {}", identityServiceUrl + "/api/users/" + userId + "/details");
        return restTemplate.getForObject(identityServiceUrl + "/api/users/" + userId + "/details", UserDetailResponse.class);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .imageUrl(item.getImageUrl())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalItemPrice(item.getTotalItemPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .shippingFirstName(order.getShippingFirstName())
                .shippingLastName(order.getShippingLastName())
                .shippingAddressStreet(order.getShippingAddressStreet())
                .shippingAddressPhone(order.getShippingAddressPhone())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .orderItems(itemResponses)
                .build();
    }
}