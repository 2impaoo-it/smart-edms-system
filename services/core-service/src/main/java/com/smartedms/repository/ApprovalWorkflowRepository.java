package com.smartedms.repository;

import com.smartedms.entity.ApprovalWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Long> {

    // Tìm tất cả workflow còn active (field tên 'active', không phải 'isActive')
    List<ApprovalWorkflow> findByActiveTrue();

    // Tìm workflow theo tên
    ApprovalWorkflow findByName(String name);
}
