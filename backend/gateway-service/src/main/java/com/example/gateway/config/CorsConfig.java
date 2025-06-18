package com.example.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        // Dozvoli ORIGIN sa kojeg dolazi tvoj frontend.
        // U produkciji bi ovo trebalo biti specifična domena (npr. "https://www.tvojadomena.com")
        // Za lokalni razvoj, localhost:3000 je ok.
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Dodaj i druge ako imaš

        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        corsConfig.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        corsConfig.setAllowCredentials(true); // Dozvoli slanje kredencijala (poput cookies ili Authorization headera)
        corsConfig.setMaxAge(3600L); // Koliko dugo preglednik može keširati CORS pre-flight odgovor

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Primijeni CORS konfiguraciju na SVE rute

        return new CorsWebFilter(source);
    }
}