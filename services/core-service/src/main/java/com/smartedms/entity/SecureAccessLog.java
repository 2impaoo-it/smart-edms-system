package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * SecureAccessLog: Ghi lại mỗi lần truy cập (thành công/thất bại) vào secure
 * folder
 */
@Entity
@Table(name = "secure_access_logs")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecureAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Secure folder được truy cập
    @Column(name = "folder_id", nullable = false)
    private Long folderId;

    // User truy cập
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // SUCCESS, FAILED (PIN sai), LOCKED (quá số lần)
    @Enumerated(EnumType.STRING)
    @Column(name = "access_result", nullable = false)
    private AccessResult accessResult;

    // Lý do thất bại
    private String failureReason;

    // IP address
    @Column(name = "ip_address")
    private String ipAddress;

    // User agent
    @Column(name = "user_agent")
    private String userAgent;

    @CreatedDate
    @Column(name = "accessed_at", updatable = false)
    private LocalDateTime accessedAt;
}
