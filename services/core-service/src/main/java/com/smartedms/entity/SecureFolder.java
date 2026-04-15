package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Secure Folder: Thư mục cần PIN để truy cập
 * Cho dù user có quyền truy cập thư mục, vẫn phải nhập PIN
 */
@Entity
@Table(name = "secure_folders")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecureFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thư mục cần bảo vệ (link từ Category)
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    // PIN hash (BCrypt)
    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    // Số lần nhập sai tối đa trước khi bị khóa
    @Column(name = "max_failed_attempts", nullable = false)
    private Integer maxFailedAttempts = 5;

    // Thời gian khóa sau khi nhập sai quá số lần (phút)
    @Column(name = "lockout_duration_minutes", nullable = false)
    private Integer lockoutDurationMinutes = 15;

    // Trạng thái: ACTIVE, LOCKED, DISABLED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SecureFolderStatus status = SecureFolderStatus.ACTIVE;

    // Lần cuối bị khóa
    @Column(name = "last_locked_at")
    private LocalDateTime lastLockedAt;

    // Mô tả
    private String description;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
