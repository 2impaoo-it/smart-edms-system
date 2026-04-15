package com.smartedms.dto;

import com.smartedms.entity.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho response khi hiển thị lịch sử duyệt
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistoryDTO {
    private Long id;
    private Long documentId;
    private String documentName;
    private Integer approvalLevel;
    private Long approverId;
    private String approverName;
    private String approverJobTitle;
    private ApprovalStatus status;
    private String rejectionReason;
    private String comments;
    private Boolean requireSignature;
    private LocalDateTime reviewedAt;
}
