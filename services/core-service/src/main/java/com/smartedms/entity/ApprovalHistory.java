package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Ghi lại từng hành động duyệt/từ chối của mỗi approver
 * VD: Document A được approve bởi Manager vào 2024-01-15 10:00
 */
@Entity
@Table(name = "approval_histories")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Document được duyệt
    @Column(name = "document_id", nullable = false)
    private Long documentId;

    // Level duyệt (thứ tự)
    @Column(name = "approval_level", nullable = false)
    private Integer approvalLevel;

    // Người duyệt
    @Column(name = "approver_id", nullable = false)
    private Long approverId;

    // APPROVED, REJECTED, PENDING
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    // Lý do từ chối (nếu có)
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // Bình luận thêm
    @Column(columnDefinition = "TEXT")
    private String comments;

    // Bắt buộc ký số hay chỉ duyệt nhanh
    @Column(name = "require_signature", columnDefinition = "boolean default false")
    private Boolean requireSignature = false;

    @CreatedDate
    @Column(name = "reviewed_at", updatable = false)
    private LocalDateTime reviewedAt;
}
