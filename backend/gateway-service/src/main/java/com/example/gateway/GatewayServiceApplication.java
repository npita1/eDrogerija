package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}

	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("identity-service", r -> r.path("/api/auth/**", "/api/users/**")
						.uri("lb://identity-service"))
				.route("product-service", r -> r.path("/api/products/**", "/api/categories/**")
						.uri("lb://product-service"))
				.route("cart-service", r -> r.path("/api/cart/**")
						.uri("lb://cart-service"))
				.route("order-service", r -> r.path("/api/orders/**")
						.uri("lb://order-service"))
				.build();
	}
}