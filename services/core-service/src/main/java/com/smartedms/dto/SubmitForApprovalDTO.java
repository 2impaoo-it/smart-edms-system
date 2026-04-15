package com.smartedms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO khi user submit document để xét duyệt
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitForApprovalDTO {
    // Document cần duyệt
    private Long documentId;

    // Workflow template có sẵn (VD: "Phê duyệt cấp 3")
    private Long approvalWorkflowId;

    // Ghi chú khi submit
    private String submitNotes;

    // Tuỳ chỉnh cấu hình duyệt (Ký số/Duyệt) cho mỗi cấp
    private List<LevelOverride> levelOverrides;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LevelOverride {
        private Integer levelOrder;
        private Boolean requireSignature;
    }
}
