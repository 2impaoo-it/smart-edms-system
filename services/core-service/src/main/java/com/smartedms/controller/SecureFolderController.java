package com.smartedms.controller;

import com.smartedms.dto.PinVerificationDTO;
import com.smartedms.dto.SecureFolderDTO;
import com.smartedms.dto.SecureAccessLogDTO;
import com.smartedms.entity.User;
import com.smartedms.repository.UserRepository;
import com.smartedms.service.SecureFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API Controller cho Secure Folders (PIN Protection)
 * Endpoint: /api/v1/secure-folders
 *
 * Feature 3: PIN Protection
 * - Tạo thư mục cần PIN
 * - Xác minh PIN trước khi truy cập
 * - Tracking access logs
 */
@RestController
@RequestMapping("/api/v1/secure-folders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Secure Folders", description = "Quản lý PIN cho thư mục bảo mật")
public class SecureFolderController {

    private final SecureFolderService secureFolderService;
    private final UserRepository userRepository;

    /**
     * Tạo secure folder (Admin only)
     * POST /api/v1/secure-folders
     */
    @PostMapping
    @Operation(summary = "Tạo thư mục bảo mật với PIN", description = "Setup PIN cho thư mục")
    public ResponseEntity<SecureFolderDTO> createSecureFolder(
            @RequestParam Long categoryId,
            @RequestParam String pin,
            @RequestParam(required = false) String description) {
        SecureFolderDTO result = secureFolderService.createSecureFolder(categoryId, pin, description);
        return ResponseEntity.ok(result);
    }

    /**
     * Xác minh PIN trước khi truy cập folder
     * POST /api/v1/secure-folders/{folderId}/verify-pin
     */
    @PostMapping("/{folderId}/verify-pin")
    @Operation(summary = "Xác minh PIN", description = "Nhập PIN để truy cập thư mục")
    public ResponseEntity<Map<String, Object>> verifyPin(
            @PathVariable Long folderId,
            @RequestBody PinVerificationDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        try {
            String ipAddress = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");

            boolean isValid = secureFolderService.verifyPin(
                    folderId, dto.getPin(),
                    getUserIdFromUsername(userDetails.getUsername()),
                    ipAddress, userAgent);

            Map<String, Object> response = new HashMap<>();
            response.put("success", isValid);
            if (isValid) {
                response.put("message", "✅ PIN đúng, bạn được phép truy cập");
            } else {
                response.put("message", "❌ PIN không đúng. Vui lòng thử lại.");
            }

            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "❌ " + e.getMessage());
            return ResponseEntity.status(403).body(response);
        }
    }

    /**
     * Đổi PIN
     * PUT /api/v1/secure-folders/{folderId}/change-pin
     */
    @PutMapping("/{folderId}/change-pin")
    @Operation(summary = "Đổi PIN", description = "Yêu cầu PIN cũ để đổi PIN mới")
    public ResponseEntity<String> changePin(
            @PathVariable Long folderId,
            @RequestParam String oldPin,
            @RequestParam String newPin) {
        try {
            secureFolderService.changePin(folderId, oldPin, newPin);
            return ResponseEntity.ok("✅ PIN đã được thay đổi");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("❌ " + e.getMessage());
        }
    }

    /**
     * Reset PIN (Admin only)
     * POST /api/v1/secure-folders/{folderId}/reset-pin
     */
    @PostMapping("/{folderId}/reset-pin")
    @Operation(summary = "Reset PIN (Admin)", description = "Admin reset PIN, unlock folder")
    public ResponseEntity<String> resetPin(
            @PathVariable Long folderId,
            @RequestParam String newPin) {
        try {
            secureFolderService.resetPin(folderId, newPin);
            return ResponseEntity.ok("✅ PIN đã được reset, thư mục được mở khóa");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("❌ " + e.getMessage());
        }
    }

    /**
     * Lấy thông tin secure folder
     * GET /api/v1/secure-folders/{folderId}
     */
    @GetMapping("/{folderId}")
    @Operation(summary = "Lấy thông tin thư mục bảo mật")
    public ResponseEntity<SecureFolderDTO> getSecureFolder(@PathVariable Long folderId) {
        SecureFolderDTO folder = secureFolderService.getSecureFolder(folderId);
        return ResponseEntity.ok(folder);
    }

    /**
     * Lấy danh sách tất cả secure folders
     * GET /api/v1/secure-folders
     */
    @GetMapping
    @Operation(summary = "Danh sách tất cả thư mục bảo mật")
    public ResponseEntity<List<SecureFolderDTO>> getAllSecureFolders() {
        List<SecureFolderDTO> folders = secureFolderService.getAllSecureFolders();
        return ResponseEntity.ok(folders);
    }

    /**
     * Xem access logs của thư mục
     * GET /api/v1/secure-folders/{folderId}/logs
     */
    @GetMapping("/{folderId}/logs")
    @Operation(summary = "Xem logs truy cập", description = "Audit trail: ai truy cập, lúc nào, thành công/thất bại")
    public ResponseEntity<List<SecureAccessLogDTO>> getAccessLogs(@PathVariable Long folderId) {
        List<SecureAccessLogDTO> logs = secureFolderService.getAccessLogs(folderId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Disable secure folder (Admin)
     * DELETE /api/v1/secure-folders/{folderId}
     */
    @DeleteMapping("/{folderId}")
    @Operation(summary = "Vô hiệu hóa PIN thư mục")
    public ResponseEntity<String> disableSecureFolder(@PathVariable Long folderId) {
        secureFolderService.disableSecureFolder(folderId);
        return ResponseEntity.ok("✅ Thư mục đã vô hiệu hóa");
    }

    // ========== HELPER METHODS ==========

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    private Long getUserIdFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User " + username + " not found"));
        return user.getId();
    }
}
