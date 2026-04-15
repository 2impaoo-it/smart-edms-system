package com.smartedms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PinVerificationDTO {
    private Long folderId;
    private String pin; // 4-6 digit PIN
    private String ipAddress;
    private String userAgent;
}
