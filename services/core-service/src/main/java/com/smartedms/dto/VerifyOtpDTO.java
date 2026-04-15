package com.smartedms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpDTO {
    private Long userId;
    private String otpCode;       // Mã 6 số nhập vào
    private String purpose;       // DIGITAL_CERT_CREATION, SIGNATURE, ...
    private String deliveryMethod; // EMAIL | MICROSOFT_AUTH (tùy chọn, để phân biệt nhánh verify)
}

