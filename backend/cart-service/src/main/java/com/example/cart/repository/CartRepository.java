package com.example.cart.repository;

import com.example.cart.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // ISPRAVNO: Metoda prima Long userId, kao što je definirano u Cart modelu
    Optional<Cart> findByUserId(Long userId);
}