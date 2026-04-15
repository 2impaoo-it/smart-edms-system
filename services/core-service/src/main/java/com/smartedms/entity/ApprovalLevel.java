package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Đại diện cho một "cấp duyệt" trong workflow
 * VD: Level 1 = Manager (user_id=5), Level 2 = Director (user_id=7), Level 3 =
 * CEO (user_id=1)
 */
@Entity
@Table(name = "approval_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thứ tự level (1, 2, 3, ...)
    @Column(name = "level_order", nullable = false)
    private Integer levelOrder;

    // Tên cấp (VD: "Quản lý bộ phận", "Giám đốc", "Tổng giám đốc")
    @Column(nullable = false)
    private String levelName;

    // ID của người phải duyệt
    @Column(name = "approver_id", nullable = false)
    private Long approverId;

    // Workflow mà level này thuộc về
    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    // Mô tả thêm về cấp này
    private String description;
}
