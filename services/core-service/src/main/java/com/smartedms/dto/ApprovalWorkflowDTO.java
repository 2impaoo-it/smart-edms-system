package com.smartedms.dto;

import com.smartedms.entity.ApprovalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflowDTO {
    private Long id;
    private String name;
    private String description;
    private ApprovalType approvalType;
    private List<ApprovalLevelDTO> approvalLevels;
    private Integer completionDaysLimit;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
