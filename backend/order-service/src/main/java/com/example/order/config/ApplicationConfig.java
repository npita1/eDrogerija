package com.example.order.config;

import com.example.order.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collections;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final JwtService jwtService; // Nije direktno korišten u interceptoru, ali može biti u drugim dijelovima aplikacije

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // Dodajemo interceptor koji će automatski dodati JWT token u zaglavlje
        restTemplate.setInterceptors(Collections.singletonList(new ClientHttpRequestInterceptor() {
            @Override
            public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
                // Dohvatimo trenutni Authentication objekat iz SecurityContextHolder-a
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                // Provjerimo da li postoji autentifikacija i da li su credentials JWT token
                // (što smo postavili u JwtAuthenticationFilter-u)
                if (authentication != null && authentication.getCredentials() instanceof String) {
                    String jwt = (String) authentication.getCredentials();
                    // Dodajemo Authorization zaglavlje sa Bearer tokenom
                    request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Bearer " + jwt);
                }
                // Nastavljamo izvršenje zahtjeva
                return execution.execute(request, body);
            }
        }));
        return restTemplate;
    }

    // Spring Security konfiguracija (standardna)
    @Bean
    public UserDetailsService userDetailsService() {
        // U order-service, UserDetailsService obično ne dohvaća korisnike iz baze podataka
        // jer je to zadatak Identity Service-a. JWT filter se brine o postavljanju UserDetails.
        // Ova implementacija je samo placeholder da bi Spring Security mogao inicijalizirati DaoAuthenticationProvider.
        return username -> {
            throw new UsernameNotFoundException("User not found via UserDetailsService in Order Service. Authentication is handled by JWT filter.");
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}