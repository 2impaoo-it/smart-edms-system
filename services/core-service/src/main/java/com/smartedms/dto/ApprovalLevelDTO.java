package com.smartedms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLevelDTO {
    private Long id;
    private Integer levelOrder;
    private String levelName;
    private Long approverId;
    private String approverName;
    private String approverJobTitle;
    private String description;
}
