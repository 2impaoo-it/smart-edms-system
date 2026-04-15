package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Lưu trữ chữ ký số của mỗi approver khi phê duyệt document
 * Mỗi approver sẽ có 1 DigitalSignature khi phê duyệt thành công
 */
@Entity
@Table(name = "digital_signatures")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Document được ký
    @Column(name = "document_id", nullable = false)
    private Long documentId;

    // Người ký (approver)
    @Column(name = "signer_id", nullable = false)
    private Long signerId;

    // Cấp duyệt (1, 2, 3, ...)
    @Column(name = "approval_level", nullable = false)
    private Integer approvalLevel;

    // Chữ ký số (được encrypt)
    @Column(columnDefinition = "TEXT", nullable = false)
    private String signatureData; // Base64 encoded signature

    // Hash của document khi được ký (để verify sau này)
    @Column(columnDefinition = "VARCHAR(512)")
    private String documentHash;

    // Certificát ID (liên kết với digital certificate)
    @Column(name = "certificate_id")
    private Long certificateId;

    // Status: VALID, REVOKED, EXPIRED
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SignatureStatus status = SignatureStatus.VALID;

    // IP address của người ký (audit trail)
    @Column(name = "signer_ip")
    private String signerIp;

    // User agent (browser, device info)
    @Column(name = "signer_user_agent")
    private String signerUserAgent;

    @CreatedDate
    @Column(name = "signed_at", updatable = false)
    private LocalDateTime signedAt;

    // Timestamp server (TSA - Time Stamp Authority) - optional
    @Column(name = "timestamp_token")
    private String timestampToken;
}
