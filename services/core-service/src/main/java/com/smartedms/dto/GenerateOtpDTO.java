package com.smartedms.dto;

import com.smartedms.entity.OtpDeliveryMethod;
import com.smartedms.entity.OtpPurpose;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateOtpDTO {
    private Long userId;
    private OtpPurpose purpose; // DIGITAL_CERT_CREATION, SIGNATURE, ...
    private OtpDeliveryMethod deliveryMethod; // EMAIL, SMS, MICROSOFT_AUTH
    private String deliveryAddress; // email hoặc phone number
}
