package com.smartedms.dto;

import com.smartedms.entity.SignatureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignatureDTO {
    private Long id;
    private Long documentId;
    private Long signerId;
    private String signerName;
    private String signerEmail;
    private Integer approvalLevel;
    private SignatureStatus status;
    private String documentHash;
    private String signerIp;
    private LocalDateTime signedAt;
    private boolean isValid;
}
