package com.example.product.jwt; // Pazi na paket!

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    // Ove varijable su ti sada potrebne samo zato što ih @Value očekuje,
    // ali ih ovaj servis neće koristiti za generisanje
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    // Ekstrakcija korisničkog imena iz tokena
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // NOVO: Metoda za ekstrakciju userId-a iz tokena
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        // Važno: Ključ "userId" mora biti isti kao što je postavljen u IdentityService
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Integer) { // JWT claims često vraćaju brojeve kao Integer ako su mali
            return ((Integer) userIdObj).longValue();
        } else if (userIdObj instanceof Long) {
            return (Long) userIdObj;
        }
        return null; // Ili baci izuzetak ako je ID obavezan
    }

    // Ekstrakcija svih autoriteta/uloga iz tokena
    public List<GrantedAuthority> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);
        String role = (String) claims.get("role"); // Pretpostavljamo da je rola spremljena kao String "role" claim
        if (role != null) {
            return List.of(new SimpleGrantedAuthority(role));
        }
        return List.of(); // Vrati praznu listu ako nema uloga
    }

    // Ekstrakcija pojedinačnih claims-a iz tokena
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Ekstrakcija svih claims-a iz tokena
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Dohvaćanje ključa za potpisivanje (iz Base64 dekodiranog tajnog ključa)
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Validacija tokena (koristi se u JwtAuthenticationFilter)
    public boolean isTokenValid(String token) {
        return !isTokenExpired(token);
    }

    // Provjera da li je token istekao
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Ekstrakcija datuma isteka iz tokena
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}