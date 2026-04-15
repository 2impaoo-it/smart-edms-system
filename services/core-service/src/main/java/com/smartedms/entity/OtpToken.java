package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * OTP Token: One-Time Password cho xác thực khi tạo chứng thư số
 * Được gửi qua Microsoft Authentication (email hoặc SMS)
 */
@Entity
@Table(name = "otp_tokens")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User thực hiện hành động (tạo chứng thư số, ký document,...)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // OTP code (6 digits)
    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    // OTP purpose: DIGITAL_CERT_CREATION, SIGNATURE, PASSWORD_RESET
    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false)
    private OtpPurpose purpose = OtpPurpose.DIGITAL_CERT_CREATION;

    // Trạng thái: PENDING, VERIFIED, EXPIRED, USED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OtpStatus status = OtpStatus.PENDING;

    // Phương tiện gửi OTP: EMAIL, SMS
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false)
    private OtpDeliveryMethod deliveryMethod = OtpDeliveryMethod.EMAIL;

    // Địa chỉ gửi (email hoặc số điện thoại)
    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    // Số lần thử (tối đa 3 lần)
    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    // Mã xác thực Microsoft (nếu dùng Microsoft auth)
    @Column(name = "microsoft_auth_code")
    private String microsoftAuthCode;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Hết hạn sau 10 phút
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Verified at
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    // IP address của request
    @Column(name = "request_ip")
    private String requestIp;
}
