package com.example.identity.jwt; // Pazi na paket - bio je com.example.identity.config, sada je com.example.identity.jwt

import com.example.identity.model.User; // Pazi na paket - bio je com.example.identity.user, sada je com.example.identity.model
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    // Subject tokena će biti username
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) { // Prima naš User model
        return generateToken(user, new HashMap<>());
    }

    public String generateToken(User user, Map<String, Object> extraClaims) {
        // Obavezni claimovi
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());

        // Dodatni, korisni claimovi (OPCIONALNO, ali preporučujem za brzi pristup u drugim servisima)
        // Ako OrderService treba ove podatke, bolje ih je dohvatiti direktno iz IdentityService-a
        // ali ako ih želiš imati u tokenu za 'brzi uvid', možeš ih dodati.
        // Ipak, za sada ih neću stavljati u token radi minimalizacije i svježine podataka.
        // Možemo ih kasnije dodati ako bude potrebe.

        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(user.getUsername()) // Subject je username (prema tvojoj specifikaciji)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user) { // Prima naš User model
        // Refresh token obično ne treba dodatne claimove osim subjecta (username)
        return Jwts
                .builder()
                .setClaims(new HashMap<>())
                .setSubject(user.getUsername()) // Subject je username
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Ovdje je userDetails parametar UserDetails interfejs, ne tvoj User model
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}