package com.smartedms.dto;

import com.smartedms.entity.OtpStatus;
import com.smartedms.entity.OtpPurpose;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpTokenDTO {
    private Long id;
    private Long userId;
    private OtpPurpose purpose;
    private OtpStatus status;
    private String deliveryMethod;
    private String maskedDeliveryAddress; // Ví dụ: user****@domain.com
    private Integer attemptCount;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private long timeRemainingSeconds; // Thời gian còn lại trước khi hết hạn
    private boolean isExpired;
}
