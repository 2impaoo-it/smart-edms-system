package com.smartedms.repository;

import com.smartedms.entity.OtpToken;
import com.smartedms.entity.OtpStatus;
import com.smartedms.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    // Lấy OTP pending của user
    Optional<OtpToken> findByUserIdAndStatusAndPurpose(Long userId, OtpStatus status, OtpPurpose purpose);

    // Lấy OTP gần nhất của user
    OtpToken findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    // Tìm OTP theo code
    Optional<OtpToken> findByOtpCodeAndStatus(String otpCode, OtpStatus status);

    // Xóa OTP hết hạn
    void deleteByExpiresAtBefore(LocalDateTime dateTime);

    // Đếm OTP hết hạn
    long countByUserIdAndStatusAndExpiresAtBefore(Long userId, OtpStatus status, LocalDateTime dateTime);

    // Lấy OTP đã verify
    Optional<OtpToken> findByUserIdAndStatusAndMicrosoftAuthCode(Long userId, OtpStatus status, String authCode);
}
