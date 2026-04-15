package com.smartedms.repository;

import com.smartedms.entity.ApprovalHistory;
import com.smartedms.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {

    // Lấy lịch sử duyệt của một document
    List<ApprovalHistory> findByDocumentIdOrderByApprovalLevelAsc(Long documentId);

    // Lấy approval chưa được xét duyệt cho một user
    List<ApprovalHistory> findByApproverIdAndStatus(Long approverId, ApprovalStatus status);

    // Lấy lịch sử duyệt tại một level cụ thể
    ApprovalHistory findByDocumentIdAndApprovalLevel(Long documentId, Integer approvalLevel);

    // Sử dụng findFirst (tránh lỗi NonUniqueResult) nếu người dùng trình duyệt lại văn bản nhiều lần
    ApprovalHistory findFirstByDocumentIdAndApprovalLevelOrderByIdDesc(Long documentId, Integer approvalLevel);

    @Query("SELECT ah FROM ApprovalHistory ah WHERE ah.documentId = :documentId AND ah.approvalLevel = :level")
    ApprovalHistory findApprovalAtLevel(@Param("documentId") Long documentId, @Param("level") Integer level);

    @Query("SELECT ah FROM ApprovalHistory ah WHERE ah.approverId = :approverId AND ah.status = 'PENDING' ORDER BY ah.reviewedAt")
    List<ApprovalHistory> findPendingApprovalsForUser(@Param("approverId") Long approverId);

    // Đếm số approval chưa xử lý cho một user
    long countByApproverIdAndStatus(Long approverId, ApprovalStatus status);

    // Lấy lịch sử tất cả các lần duyệt đã xử lý (APPROVED hoặc REJECTED) bởi user này
    @Query("SELECT ah FROM ApprovalHistory ah WHERE ah.approverId = :approverId AND ah.status <> 'PENDING' ORDER BY ah.reviewedAt DESC")
    List<ApprovalHistory> findProcessedApprovalsForUser(@Param("approverId") Long approverId);
}
