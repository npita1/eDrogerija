package com.example.product.config;

import com.example.product.filter.JwtAuthenticationFilter;
import com.example.product.jwt.JwtService;
import com.example.product.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtService jwtService;

    private static final String[] SWAGGER_WHITELIST = {
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/swagger-ui.html"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(request -> request
                        // Dozvoli pristup Swagger UI resursima
                        .requestMatchers(SWAGGER_WHITELIST).permitAll()

                        // JAVNE ENDPOINTI (GET metode za proizvode)
                        // Svako može vidjeti sve proizvode
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        // Svako može vidjeti pojedinačni proizvod
                        .requestMatchers(HttpMethod.GET, "/api/products/{id}").permitAll()

                        // ZAŠTIĆENI ENDPOINTI (ADMIN uloga)
                        // Samo ADMIN može kreirati proizvod
                        .requestMatchers(HttpMethod.POST, "/api/products").hasAuthority(Role.ADMIN.name())
                        // Samo ADMIN može ažurirati proizvod
                        .requestMatchers(HttpMethod.PUT, "/api/products/{id}").hasAuthority(Role.ADMIN.name())
                        // Samo ADMIN može obrisati proizvod
                        .requestMatchers(HttpMethod.DELETE, "/api/products/{id}").hasAuthority(Role.ADMIN.name())


                        .anyRequest().authenticated())
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}