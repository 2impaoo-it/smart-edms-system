package com.smartedms;

import com.smartedms.model.Role;
import com.smartedms.model.User;
import com.smartedms.repository.RoleRepository;
import com.smartedms.repository.UserRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Running DataSeeder to ensure sample roles and users exist");

        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> roleRepository.save(new Role(null, "ADMIN")));
        Role userRole = roleRepository.findByName("USER").orElseGet(() -> roleRepository.save(new Role(null, "USER")));

        Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
            logger.info("Created admin user with username 'admin'");
        } else {
            logger.info("Admin user already exists");
        }

        Optional<User> staffOpt = userRepository.findByUsername("staff");
        if (staffOpt.isEmpty()) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setPassword(passwordEncoder.encode("123456"));
            staff.getRoles().add(userRole);
            userRepository.save(staff);
            logger.info("Created staff user with username 'staff'");
        } else {
            logger.info("Staff user already exists");
        }
    }

}
