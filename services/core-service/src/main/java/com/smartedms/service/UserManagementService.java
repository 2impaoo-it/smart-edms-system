package com.smartedms.service;

import com.smartedms.dto.CreateUserRequest;
import com.smartedms.entity.Role;
import com.smartedms.entity.User;
import com.smartedms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Set;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String defaultPassword;

    public UserManagementService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.user.default-password}") String defaultPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultPassword = defaultPassword;
    }

    @Transactional
    public User createByAdmin(CreateUserRequest request) {
        String username = normalize(request.getUsername());
        String email = normalize(request.getEmail());
        String fullName = normalize(request.getFullName());
        String roleValue = normalize(request.getRole());

        if (username.isBlank() || email.isBlank() || fullName.isBlank() || roleValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required fields");
        }

        if (defaultPassword == null || defaultPassword.trim().length() < 8) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "System default password is not configured correctly");
        }

        if (userRepository.findByUsernameOrEmail(username, email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username or email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(defaultPassword.trim()));
        user.setMustChangePassword(true);
        user.setRoles(resolveRoles(roleValue));

        return userRepository.save(user);
    }

    private Set<Role> resolveRoles(String roleValue) {
        String normalized = roleValue.toUpperCase(Locale.ROOT);
        Role selectedRole;
        try {
            selectedRole = Role.valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "role must be one of ROLE_USER, ROLE_MANAGER, ROLE_ADMIN");
        }

        if (selectedRole == Role.ROLE_MANAGER || selectedRole == Role.ROLE_ADMIN) {
            return Set.of(selectedRole, Role.ROLE_USER);
        }

        return Set.of(selectedRole);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
