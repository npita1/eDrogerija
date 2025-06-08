package com.example.order.filter;

import com.example.order.jwt.JwtService;
import com.example.order.model.Role; // Uvjerite se da je ovo ispravan import za vaš Role enum
import com.example.order.model.User; // Uvjerite se da je ovo ispravan import za vaš User model
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Prvo provjerimo OPTIONS metodu za CORS preflight requeste
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        final Long userId;
        final String roleName;

        // Ako Authorization header ne postoji ili ne počinje sa "Bearer ", preskoči filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7); // Ekstraktuj JWT token (preskoči "Bearer ")
        username = jwtService.extractUsername(jwt);

        // Ako je username validan i nema postojeće autentifikacije u SecurityContext-u
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Pokušavamo izvući userId i rolu iz JWT claimova
                userId = jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
                roleName = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
            } catch (Exception e) {
                // Logiramo grešku ako ne uspijemo izvući claimove i propuštamo zahtjev bez autentifikacije
                System.err.println("Failed to extract userId or role from JWT claims: " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }

            // Kreiramo UserDetails objekat koristeći vaš vlastiti User model
            // Važno: User model mora implementirati UserDetails i imati konstruktor/builder
            // koji prihvata id, username i role.
            User userDetails = User.builder()
                    .id(userId)
                    .username(username)
                    .role(Role.valueOf(roleName)) // Pretpostavljamo da imate Role enum
                    .build();

            // Ako je token validan za dohvaćenog korisnika
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Kreiramo UsernamePasswordAuthenticationToken
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // Principal: naš User objekat (sadrži userId, username, role)
                        jwt,         // <-- OVDJE SNIMAMO ORIGINALNI JWT TOKEN KAO CREDENTIALS
                        userDetails.getAuthorities() // Autorizacije (uloge)
                );
                // Postavljamo detalje web autentifikacije
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                // Postavljamo Authentication objekat u SecurityContextHolder
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Nastavljamo lanac filtera
        filterChain.doFilter(request, response);
    }
}