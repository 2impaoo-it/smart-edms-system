package com.smartedms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO khi approver approve hoặc reject document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionDTO {
    private Long documentId;

    // true = approve, false = reject
    private Boolean approved;

    // Lý do từ chối (bắt buộc nếu approved = false)
    private String rejectionReason;

    // Bình luận thêm
    private String comments;
}
