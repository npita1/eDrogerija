package com.example.cart.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList; // DODAJ OVO
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //userId je Long jer ga izvlacimo iz JWT tokena kao Long.
    // Ovo je preporučeno za identifikaciju korisnika u bazi
    @Column(nullable = false, unique = true)
    private Long userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // OVO DODAJ AKO KORISTIŠ @Builder
    private List<CartItem> items = new ArrayList<>(); // OVO JE KLJUČNA PROMJENA: INICIJALIZACIJA

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Pomocne metode za dodavanje/uklanjanje stavki (opciono, ali dobra praksa)
    public void addItem(CartItem item) {
        if (items == null) { // Dodatna sigurnost, ali Builder.Default bi trebao riješiti ovo
            items = new ArrayList<>();
        }
        items.add(item);
        item.setCart(this); // Postavi referencu na cart u itemu
    }

    public void removeItem(CartItem item) {
        if (items != null) {
            items.remove(item);
            item.setCart(null); // Ukloni referencu
        }
    }
}