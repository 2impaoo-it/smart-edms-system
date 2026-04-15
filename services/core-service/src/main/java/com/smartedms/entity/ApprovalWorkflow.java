package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "approval_workflows")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Document ID được duyệt (link đến document)
    @Column(name = "document_id")
    private Long documentId;

    // Tên template (VD: "Phê duyệt cấp 3", "Phê duyệt cấp 1")
    @Column(nullable = false)
    private String name;

    // Mô tả về workflow này
    private String description;

    // Loại duyệt: SEQUENTIAL (tuần tự) hoặc PARALLEL (song song)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalType approvalType = ApprovalType.SEQUENTIAL;

    // Danh sách các level duyệt
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "workflow_id")
    @OrderBy("levelOrder ASC")
    private List<ApprovalLevel> approvalLevels;

    // Hạn để hoàn thành duyệt (số ngày)
    @Column(name = "completion_days_limit")
    private Integer completionDaysLimit = 7;

    // Ngày hết hạn cho reminder (Feature 5)
    @Column(name = "deadline_date")
    private LocalDate deadlineDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Trạng thái active (Lombok sẽ tạo getter isActive() và setter setActive() cho primitive boolean)
    // Dùng @Setter(name="setIsActive") hoặc dùng tên field không có prefix 'is'
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;
}
