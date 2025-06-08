package com.example.cart.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    private Long productId; // ID proizvoda iz ProductService-a
    private String productName; // Može se keširati radi jednostavnosti
    private String imageUrl; // Može se keširati
    private BigDecimal price; // Cijena u trenutku dodavanja u košaricu
    private Integer quantity; // Količina tog proizvoda u košarici

    // Metoda za izračunavanje ukupne cijene stavke
    public BigDecimal getTotalPrice() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }
}