package com.smartedms.controller;

import com.smartedms.dto.GenerateOtpDTO;
import com.smartedms.dto.OtpTokenDTO;
import com.smartedms.dto.TotpSetupResponseDTO;
import com.smartedms.dto.VerifyOtpDTO;
import com.smartedms.security.CustomUserDetails;
import com.smartedms.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API Controller cho OTP Authentication
 * Endpoint: /api/v1/otp
 *
 * Hỗ trợ 2 phương thức:
 *  1. EMAIL          → Tạo + gửi mã ngẫu nhiên qua email
 *  2. MICROSOFT_AUTH → TOTP (RFC 6238), tương thích với Microsoft/Google Authenticator
 */
@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "OTP Authentication", description = "One-Time Password Authentication (Email & TOTP)")
public class OtpController {

    private final OtpService otpService;

    /**
     * Khởi động OTP cho một purpose.
     * POST /api/v1/otp/generate
     *
     * Body:
     * {
     *   "userId": 1,
     *   "purpose": "DIGITAL_CERT_CREATION",
     *   "deliveryMethod": "MICROSOFT_AUTH" | "EMAIL",
     *   "deliveryAddress": "user@domain.com"  (chỉ cần khi method=EMAIL)
     * }
     *
     * Response khi MICROSOFT_AUTH:
     * {
     *   "success": true,
     *   "requiresSetup": true,          ← Lần đầu: cần quét QR
     *   "qrCodeUri": "otpauth://...",   ← URI để render QR Code
     *   "secretKey": "BASE32SECRET"     ← Nhập thủ công nếu không quét được
     * }
     * hoặc:
     * {
     *   "success": true,
     *   "requiresSetup": false,          ← Đã setup: nhập mã trong app
     *   "message": "Mở app và nhập mã"
     * }
     */
    @PostMapping("/generate")
    @Operation(summary = "Tạo/Khởi động OTP", description = "Email: gửi mã qua email. MICROSOFT_AUTH: trả về QR Code nếu lần đầu.")
    public ResponseEntity<Map<String, Object>> generateOtp(
            @RequestBody GenerateOtpDTO request,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest servletRequest) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "❌ Chưa đăng nhập"));
            }
            request.setUserId(currentUser.getId());
            String clientIp = getClientIp(servletRequest);
            Object result = otpService.generateOtp(request, clientIp);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);

            // Nếu là TOTP response → truyền trực tiếp các field ra ngoài
            if (result instanceof TotpSetupResponseDTO totpResp) {
                response.put("requiresSetup", totpResp.isRequiresSetup());
                response.put("message", totpResp.getMessage());
                if (totpResp.getQrCodeUri() != null) {
                    response.put("qrCodeUri", totpResp.getQrCodeUri());
                    response.put("secretKey", totpResp.getSecretKey());
                }
            } else if (result instanceof OtpTokenDTO emailResp) {
                // Email OTP → hiện địa chỉ đã gửi
                response.put("message", "✅ OTP đã được gửi đến " + emailResp.getMaskedDeliveryAddress());
                response.put("data", emailResp);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi generate OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ " + e.getMessage()
            ));
        }
    }

    /**
     * Xác minh mã OTP người dùng nhập.
     * POST /api/v1/otp/verify
     *
     * Body:
     * {
     *   "userId": 1,
     *   "otpCode": "123456",
     *   "purpose": "DIGITAL_CERT_CREATION",
     *   "deliveryMethod": "MICROSOFT_AUTH" (hoặc bỏ qua để mặc định EMAIL)
     * }
     */
    @PostMapping("/verify")
    @Operation(summary = "Xác minh mã OTP", description = "Verify cả Email OTP lẫn TOTP (Authenticator)")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestBody VerifyOtpDTO request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "❌ Chưa đăng nhập"));
            }
            request.setUserId(currentUser.getId());
            boolean isValid = otpService.verifyOtp(request);
            Map<String, Object> response = new HashMap<>();
            if (isValid) {
                response.put("success", true);
                response.put("message", "✅ Xác thực thành công!");
            } else {
                response.put("success", false);
                response.put("message", "❌ Mã không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
            }
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "❌ " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Lỗi khi verify OTP: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "❌ Lỗi hệ thống. Vui lòng thử lại."
            ));
        }
    }

    /**
     * Xác nhận setup TOTP lần đầu (sau khi quét QR).
     * POST /api/v1/otp/totp/setup-confirm
     *
     * Body: { "otpCode": "123456" }
     * userId lấy tự động từ JWT đang đăng nhập – không truyền trong body để tránh giả mạo.
     */
    @PostMapping("/totp/setup-confirm")
    @Operation(summary = "Xác nhận setup TOTP lần đầu", description = "Gọi sau khi quét QR. Lưu mfaEnabled=true nếu mã đúng.")
    public ResponseEntity<Map<String, Object>> confirmTotpSetup(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "❌ Chưa đăng nhập"));
            }
            String otpCode = body.get("otpCode").toString();

            TotpSetupResponseDTO result = otpService.confirmTotpSetup(currentUser.getId(), otpCode);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", result.getMessage()
            ));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "❌ " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Lỗi khi confirm TOTP setup: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy status OTP hiện tại (cho EMAIL method)
     * GET /api/v1/otp/{userId}/status
     */
    @GetMapping("/{userId}/status")
    @Operation(summary = "Xem trạng thái OTP (Email)", description = "Kiểm tra hạn, số lần thử")
    public ResponseEntity<Map<String, Object>> getOtpStatus(
            @PathVariable Long userId,
            @RequestParam String purpose) {
        try {
            OtpTokenDTO otp = otpService.getOtpStatus(userId, purpose);
            return ResponseEntity.ok(Map.of("success", true, "data", otp));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "❌ " + e.getMessage()
            ));
        }
    }

    /**
     * Danh sách delivery methods hỗ trợ
     * GET /api/v1/otp/delivery-methods
     */
    @GetMapping("/delivery-methods")
    @Operation(summary = "Xem phương tiện gửi OTP")
    public ResponseEntity<Map<String, Object>> getDeliveryMethods() {
        List<Map<String, String>> methods = List.of(
                Map.of("name", "EMAIL",          "display", "Email"),
                Map.of("name", "MICROSOFT_AUTH", "display", "Microsoft Authenticator"),
                Map.of("name", "SMS",            "display", "Tin nhắn SMS")
        );
        return ResponseEntity.ok(Map.of("methods", methods));
    }

    /**
     * Danh sách OTP purposes
     * GET /api/v1/otp/purposes
     */
    @GetMapping("/purposes")
    @Operation(summary = "Xem mục đích dùng OTP")
    public ResponseEntity<Map<String, Object>> getOtpPurposes() {
        List<Map<String, String>> purposes = List.of(
                Map.of("name", "DIGITAL_CERT_CREATION", "display", "Tạo chứng thư số"),
                Map.of("name", "SIGNATURE",              "display", "Ký tài liệu"),
                Map.of("name", "PASSWORD_RESET",         "display", "Đặt lại mật khẩu"),
                Map.of("name", "TWO_FACTOR_AUTH",        "display", "Xác thực 2 yếu tố")
        );
        return ResponseEntity.ok(Map.of("purposes", purposes));
    }

    // ========== HELPER ==========

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
