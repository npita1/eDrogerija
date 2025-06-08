package com.example.product.config;

import com.example.product.model.Category;
import com.example.product.model.Product;
import com.example.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for initial product data...");

        log.info("Categories are defined as enum, no seeding required for Category entity itself.");

        if (productRepository.count() == 0) {
            log.info("No products found. Creating products...");

            Product proizvod1 = Product.builder()
                    .name("Multivitamin kompleks")
                    .description("Potpuni multivitamin za svakodnevnu upotrebu")
                    .price(new BigDecimal("25.99"))
                    .quantity(120)
                    .imageUrl("url_do_slike_multivit_health")
                    .brand("Generic Health")
                    .category(Category.ZDRAVLJE)
                    .build();

            Product proizvod2 = Product.builder()
                    .name("Paleta sjenila Nude")
                    .description("Paleta sjenila sa 12 neutralnih nijansi")
                    .price(new BigDecimal("39.50"))
                    .quantity(80)
                    .imageUrl("url_do_slike_sjenila_makeup")
                    .brand("Brand X Cosmetics")
                    .category(Category.SMINKA)
                    .build();

            Product proizvod3 = Product.builder()
                    .name("Antibakterijski sapun")
                    .description("Sapun za ruke sa zaštitom od bakterija")
                    .price(new BigDecimal("5.00"))
                    .quantity(200)
                    .imageUrl("url_do_slike_sapuna_hygiene")
                    .brand("CleanCo")
                    .category(Category.HIGIJENA)
                    .build();

            Product proizvod4 = Product.builder()
                    .name("Proteinski prah (Whey)")
                    .description("Visokokvalitetni protein za mišićni rast")
                    .price(new BigDecimal("60.00"))
                    .quantity(90)
                    .imageUrl("url_do_slike_proteina_supplements")
                    .brand("MuscleTech Pro")
                    .category(Category.SUPLEMENTI)
                    .build();

            Product proizvod5 = Product.builder()
                    .name("Hijaluronski serum")
                    .description("Serum za intenzivnu hidrataciju kože")
                    .price(new BigDecimal("45.00"))
                    .quantity(70)
                    .imageUrl("url_do_slike_seruma_skincare")
                    .brand("SkinCare Solutions")
                    .category(Category.NJEGA_KOZE)
                    .build();

            Product proizvod6 = Product.builder()
                    .name("Regenerator za oštećenu kosu")
                    .description("Dubinski regenerator za oporavak kose")
                    .price(new BigDecimal("18.75"))
                    .quantity(110)
                    .imageUrl("url_do_slike_regeneratora_haircare")
                    .brand("HairRescue")
                    .category(Category.NJEGA_KOSE)
                    .build();

            Product proizvod7 = Product.builder()
                    .name("Eau de Parfum 'Elegance'")
                    .description("Muški parfem sa drvenastim notama")
                    .price(new BigDecimal("75.00"))
                    .quantity(40)
                    .imageUrl("url_do_slike_parfema_perfumes")
                    .brand("Elegant Scents")
                    .category(Category.PARFEMI)
                    .build();

            Product proizvod8 = Product.builder()
                    .name("Brijanje pjena Sensitive")
                    .description("Pjena za brijanje za osjetljivu kožu")
                    .price(new BigDecimal("9.20"))
                    .quantity(150)
                    .imageUrl("url_do_slike_pjene_menscare")
                    .brand("Grooming Essentials")
                    .category(Category.MUSKA_NJEGA)
                    .build();

            productRepository.saveAll(List.of(proizvod1, proizvod2, proizvod3, proizvod4, proizvod5, proizvod6, proizvod7, proizvod8));
            log.info("Products created.");
        } else {
            log.info("Products already exist.");
        }
    }
}