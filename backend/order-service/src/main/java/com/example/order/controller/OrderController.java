package com.example.order.controller;

import com.example.order.dto.OrderResponse;
import com.example.order.model.OrderStatus;
import com.example.order.model.User;
import com.example.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Kreiranje nove narudžbe iz košarice
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OrderResponse> placeOrder(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = extractUserIdFromUserDetails(userDetails);
        OrderResponse order = orderService.placeOrder(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    // Dohvat svih narudžbi za trenutno autentificiranog korisnika
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = extractUserIdFromUserDetails(userDetails);
        List<OrderResponse> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // Dohvat narudžbe po broju narudžbe
    @GetMapping("/{orderNumber}")
    @ResponseStatus(HttpStatus.OK)
    // @PreAuthorize provjerava da li je korisnik ADMIN ILI da li je ID korisnika (iz tokena) isti kao userId narudžbe.
    @PreAuthorize("hasRole('ADMIN') or @orderService.getOrderByOrderNumber(#orderNumber).userId == authentication.principal.id")
    public ResponseEntity<OrderResponse> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    // Ažuriranje statusa narudžbe (samo za ADMINA)
    @PutMapping("/{orderNumber}/status")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        OrderResponse updatedOrder = orderService.updateOrderStatus(orderNumber, status);
        return ResponseEntity.ok(updatedOrder);
    }

    // Pomoćna metoda za dohvat userId iz UserDetails
    private Long extractUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return ((User) userDetails).getId();
        }
        throw new IllegalStateException("Authentication principal is not of type User or does not contain userId.");
    }
}