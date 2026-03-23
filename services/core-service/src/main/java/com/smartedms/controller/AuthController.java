package com.smartedms.controller;

import com.smartedms.dto.LoginRequest;
import com.smartedms.dto.AuthResponse;
import com.smartedms.utils.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Operation(summary = "Đăng nhập", description = "Xác thực người dùng và trả về JWT token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng nhập thành công", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Sai email hoặc mật khẩu"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. Xác thực User/Pass (Spring Security tự làm bước check DB)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        // 2. Nếu đúng Pass -> Sinh Token với roles từ Authentication
        String token = jwtUtils.generateToken(
                authentication.getName(),
                authentication.getAuthorities());

        // 3. Trả về cho Client
        return ResponseEntity.ok(new AuthResponse(token, "Bearer"));
    }
}
