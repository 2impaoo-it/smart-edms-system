package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@EntityListeners(AuditingEntityListener.class)
@Data
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "folder_id")
    private Long folderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DocumentStatus status = DocumentStatus.DRAFT;

    // Thêm: ID của chuỗi duyệt được gán cho document này
    @Column(name = "approval_workflow_id")
    private Long approvalWorkflowId;

    // Thêm: Level duyệt hiện tại (1, 2, 3, ...)
    @Column(name = "current_approval_level")
    private Integer currentApprovalLevel;

    // Thêm: Lý do từ chối (nếu có)
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // Thêm: Hạn duyệt
    @Column(name = "approval_due_date")
    private LocalDateTime approvalDueDate;

    // Cũ: người duyệt (nếu cần giữ lại)
    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private Long createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private Long updatedBy;

}
