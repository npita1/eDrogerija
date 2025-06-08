package com.example.cart.repository;

import com.example.cart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Pronađi stavku košarice po ID-u košarice i ID-u proizvoda
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
}