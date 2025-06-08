package com.example.order.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order; // Veza na Order entitet

    @Column(nullable = false)
    private Long productId; // ID proizvoda iz ProductService-a

    @Column(nullable = false)
    private String productName; // Ime proizvoda (kopirano iz ProductService-a)

    @Column(nullable = true)
    private String imageUrl; // Slika proizvoda (kopirano)

    @Column(nullable = false)
    private BigDecimal unitPrice; // Cijena po jedinici u trenutku narudžbe

    @Column(nullable = false)
    private Integer quantity; // Količina naručenog proizvoda

    // Izračunata ukupna cijena za ovu stavku narudžbe
    public BigDecimal getTotalItemPrice() {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}