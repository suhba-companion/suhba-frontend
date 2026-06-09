package com.suhba.configuration;

import com.suhba.persistence.entities.AdminUserEntity;
import com.suhba.persistence.repositories.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        if (adminPassword.isBlank()) {
            log.warn("No admin users exist and admin.password is not configured — admin panel will be inaccessible");
            return;
        }
        AdminUserEntity admin = new AdminUserEntity();
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        repository.save(admin);
        log.info("Created initial admin user: {}", adminUsername);
    }
}
