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
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747455927/assets/pas/images/806a1f7a-81df-4ee4-8848-212a172bec35/mivolis-a-z-tablete-dodatak-prehrani-s-vitaminima-mineralima-i-elementima-u-tragovima-100-kom")
                    .brand("Generic Health")
                    .category(Category.ZDRAVLJE)
                    .build();

            Product proizvod2 = Product.builder()
                    .name("Paleta sjenila Nude")
                    .description("Paleta sjenila sa 12 neutralnih nijansi")
                    .price(new BigDecimal("39.50"))
                    .quantity(80)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747499036/assets/pas/images/f38bb60a-80ee-42d2-989e-abd10afa3c7b/revolution-reloaded-paleta-sjena-za-oci-basic-mattes")
                    .brand("Brand X Cosmetics")
                    .category(Category.SMINKA)
                    .build();

            Product proizvod3 = Product.builder()
                    .name("Antibakterijski sapun")
                    .description("Sapun za ruke sa zaštitom od bakterija")
                    .price(new BigDecimal("5.00"))
                    .quantity(200)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747427530/assets/pas/images/a333021f-3697-4ce3-8058-3c553ba6b779/lahor-antibakterijski-cvrsti-sapun-za-ruke")
                    .brand("CleanCo")
                    .category(Category.HIGIJENA)
                    .build();

            Product proizvod4 = Product.builder()
                    .name("Proteinski prah (Whey)")
                    .description("Visokokvalitetni protein za mišićni rast")
                    .price(new BigDecimal("60.00"))
                    .quantity(90)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747426946/assets/pas/images/9f3843e5-56a9-4546-8e43-0d491bc4f975/proteini-si-100-natural-whey-protein-u-prahu-vanilija")
                    .brand("MuscleTech Pro")
                    .category(Category.SUPLEMENTI)
                    .build();

            Product proizvod5 = Product.builder()
                    .name("Hijaluronski serum")
                    .description("Serum za intenzivnu hidrataciju kože")
                    .price(new BigDecimal("45.00"))
                    .quantity(70)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747429032/assets/pas/images/252aa222-63e9-4dff-bb53-0a1824f9c300/mak-skincare-aqua-bomb-serum-za-lice")
                    .brand("SkinCare Solutions")
                    .category(Category.NJEGA_KOZE)
                    .build();

            Product proizvod6 = Product.builder()
                    .name("Regenerator za oštećenu kosu")
                    .description("Dubinski regenerator za oporavak kose")
                    .price(new BigDecimal("18.75"))
                    .quantity(110)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747407451/assets/pas/images/1eaf3f15-86b5-4bb4-bd87-c729e73e3157/maui-moisture-revive-hydrate-regenerator-za-suhu-i-ostecenu-kosu")
                    .brand("HairRescue")
                    .category(Category.NJEGA_KOSE)
                    .build();

            Product proizvod7 = Product.builder()
                    .name("Eau de Parfum 'Elegance'")
                    .description("Muški parfem sa drvenastim notama")
                    .price(new BigDecimal("75.00"))
                    .quantity(40)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747421798/assets/pas/images/8e8cd00c-df9e-4de3-9ce6-edb8bad88c5a/burberry-london-men-edt")
                    .brand("Elegant Scents")
                    .category(Category.PARFEMI)
                    .build();

            Product proizvod8 = Product.builder()
                    .name("Brijanje pjena Sensitive")
                    .description("Pjena za brijanje za osjetljivu kožu")
                    .price(new BigDecimal("9.20"))
                    .quantity(150)
                    .imageUrl("https://products.dm-static.com/images/f_auto,q_auto,c_fit,h_440,w_500/v1747487199/assets/pas/images/59844571-9398-4bd6-825a-08689399aeba/balea-men-sensitive-pjena-za-brijanje")
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