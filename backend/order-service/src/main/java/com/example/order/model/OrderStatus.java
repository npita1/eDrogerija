package com.example.order.model;

public enum OrderStatus {
    PENDING,        // Narudžba kreirana, čeka obradu
    PROCESSING,     // Narudžba se obrađuje (npr. pakiranje, priprema za slanje)
    SHIPPED,        // Narudžba poslana
    DELIVERED,      // Narudžba dostavljena
    CANCELLED       // Narudžba otkazana
}