package com.example.cart.controller;

import com.example.cart.dto.AddToCartRequest;
import com.example.cart.dto.CartResponse;
import com.example.cart.jwt.JwtService; // Dodaj import za JwtService
import com.example.cart.model.User;
import com.example.cart.service.CartService;
import jakarta.servlet.http.HttpServletRequest; // Dodaj import
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final JwtService jwtService; // Injektuj JwtService

    // Pomoćna metoda za dohvaćanje JWT tokena iz requesta
    private String extractJwtFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    // Dohvati ili kreiraj košaricu za prijavljenog korisnika
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal User user, HttpServletRequest request) {
        String jwt = extractJwtFromRequest(request);
        if (jwt == null) {
            // Ovo se ne bi trebalo desiti s obzirom na SecurityConfig, ali za sigurnost
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.extractUserId(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // UserId nije u tokenu
        }
        CartResponse cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(cart);
    }

    // Dodaj proizvod u košaricu
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addProductToCart(@AuthenticationPrincipal User user,
                                                         @Valid @RequestBody AddToCartRequest request,
                                                         HttpServletRequest httpRequest) { // Promijenjen naziv parametra da ne bude kolizija
        String jwt = extractJwtFromRequest(httpRequest);
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.extractUserId(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CartResponse updatedCart = cartService.addProductToCart(userId, request);
        return new ResponseEntity<>(updatedCart, HttpStatus.OK);
    }

    // Ažuriraj količinu proizvoda u košarici
    @PutMapping("/update/{productId}")
    public ResponseEntity<CartResponse> updateProductQuantity(@AuthenticationPrincipal User user,
                                                              @PathVariable Long productId,
                                                              @RequestParam Integer quantity,
                                                              HttpServletRequest httpRequest) {
        String jwt = extractJwtFromRequest(httpRequest);
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.extractUserId(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CartResponse updatedCart = cartService.updateProductQuantity(userId, productId, quantity);
        return new ResponseEntity<>(updatedCart, HttpStatus.OK);
    }

    // Ukloni proizvod iz košarice
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeProductFromCart(@AuthenticationPrincipal User user,
                                                      @PathVariable Long productId,
                                                      HttpServletRequest httpRequest) {
        String jwt = extractJwtFromRequest(httpRequest);
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.extractUserId(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        cartService.removeProductFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // Isprazni cijelu košaricu
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user, HttpServletRequest httpRequest) {
        String jwt = extractJwtFromRequest(httpRequest);
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.extractUserId(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}