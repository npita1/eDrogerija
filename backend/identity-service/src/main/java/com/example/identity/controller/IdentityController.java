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
import com.example.identity.model.User;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class IdentityController {

    private final UserService userService;

    @GetMapping("/{userId}/details")
    @PreAuthorize("hasRole('ADMIN') or (#userId != null and #userId == ((T(com.example.identity.model.User)authentication.principal).id))")
    public ResponseEntity<UserDetailResponse> getUserDetails(@PathVariable Long userId,
                                                             @AuthenticationPrincipal User userPrincipal) {
        if (userPrincipal == null || userPrincipal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!userPrincipal.getRole().name().equals("ADMIN") && !userPrincipal.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserDetailResponse userDetails = userService.getUserDetailsById(userId);
        return ResponseEntity.ok(userDetails);
    }

}