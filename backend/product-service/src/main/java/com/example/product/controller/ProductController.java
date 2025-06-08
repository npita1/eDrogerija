package com.example.product.controller;

import com.example.product.dto.ProductRequest; // DODANO
import com.example.product.dto.ProductResponse;
import com.example.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Stvori novi proizvod (samo ADMIN) - SADA PRIMA PRODUCTREQUEST
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return productService.createProduct(productRequest);
    }

    // Dohvati sve proizvode (USER i ADMIN)
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    // Dohvati proizvod po ID-u (USER i ADMIN)
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // Ažuriraj proizvod (samo ADMIN) - SADA PRIMA PRODUCTREQUEST
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest productRequest) {
        return productService.updateProduct(id, productRequest);
    }

    // Obriši proizvod (samo ADMIN)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    // ENDPOINTI ZA INTER-SERVICE KOMUNIKACIJU
    @PostMapping("/decrease-quantity/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Void> decreaseProductQuantity(@PathVariable Long productId, @RequestParam Integer quantity) {
        productService.decreaseProductQuantity(productId, quantity);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/increase-quantity/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Void> increaseProductQuantity(@PathVariable Long productId, @RequestParam Integer quantity) {
        productService.increaseProductQuantity(productId, quantity);
        return ResponseEntity.ok().build();
    }
}