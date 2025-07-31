package com.example.identity.config;

import com.example.identity.model.Role;
import com.example.identity.model.User;
import com.example.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for initial user data...");

        if (userRepository.findByUsername("admin").isEmpty()) {
            log.info("Admin user not found. Creating admin user...");
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("adminpass"))
                    .email("admin@example.com")
                    .firstName("Admin")
                    .lastName("User")
                    .phoneNumber("061123456")
                    .address("Admin St. 1")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created.");
        } else {
            log.info("Admin user already exists.");
        }

        if (userRepository.findByUsername("user1").isEmpty()) {
            log.info("User 'user1' not found. Creating 'user1'...");
            User user1 = User.builder()
                    .username("user1")
                    .password(passwordEncoder.encode("user1pass"))
                    .email("user1@example.com")
                    .firstName("Test")
                    .lastName("User1")
                    .phoneNumber("062789012")
                    .address("User1 St. 10")
                    .role(Role.USER)
                    .build();
            userRepository.save(user1);
            log.info("User 'user1' created.");
        } else {
            log.info("User 'user1' already exists.");
        }

    }
}