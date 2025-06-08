package com.example.identity.controller;

import com.example.identity.dto.UserDetailResponse;
import com.example.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.persistence.EntityNotFoundException;
import com.example.identity.model.User; // Pretpostavljam da je ovo tvoja User klasa koja implementira UserDetails

@RestController
@RequestMapping("/api/users") // Nova bazna putanja za korisničke detalje
@RequiredArgsConstructor
public class IdentityController {

    private final UserService userService;

    @GetMapping("/{userId}/details")
    // @PreAuthorize osigurava da samo ADMIN ili korisnik čiji se ID podudara može pristupiti
    @PreAuthorize("hasRole('ADMIN') or (#userId != null and #userId == ((T(com.example.identity.model.User)authentication.principal).id))")
    public ResponseEntity<UserDetailResponse> getUserDetails(@PathVariable Long userId,
                                                             @AuthenticationPrincipal User userPrincipal) { // Koristim 'userPrincipal' za jasnoću
        // Dodatna provjera za sigurnost i tip-sigurnost (iako @PreAuthorize već radi većinu)
        if (userPrincipal == null || userPrincipal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Ako korisnik nije ADMIN i traži detalje drugog korisnika, vrati 403 Forbidden
        if (!userPrincipal.getRole().name().equals("ADMIN") && !userPrincipal.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserDetailResponse userDetails = userService.getUserDetailsById(userId);
        return ResponseEntity.ok(userDetails);
    }

    // Ovdje možete dodati i druge CRUD operacije za korisnike (npr. ažuriranje, brisanje)
    // ali pazite na autorizaciju (npr. samo ADMIN ili korisnik sam za sebe)
}