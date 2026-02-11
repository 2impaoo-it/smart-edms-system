package com.smartedms.backend.config;

import com.smartedms.backend.model.ERole;
import com.smartedms.backend.model.Role;
import com.smartedms.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_MANAGER));
            roleRepository.save(new Role(ERole.ROLE_DIRECTOR));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Default roles seeded.");
        }
    }
}
