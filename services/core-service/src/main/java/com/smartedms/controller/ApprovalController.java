package com.smartedms.controller;

import com.smartedms.dto.ApprovalActionDTO;
import com.smartedms.dto.ApprovalHistoryDTO;
import com.smartedms.dto.ApprovalWorkflowDTO;
import com.smartedms.dto.SubmitForApprovalDTO;
import com.smartedms.service.ApprovalWorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import com.smartedms.repository.UserRepository;
import com.smartedms.entity.User;
import org.springframework.web.server.ResponseStatusException;

/**
 * API Controller cho Document Approval Workflow
 * Endpoint: /api/v1/approvals
 */
@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Approval Workflow", description = "Quản lý workflow duyệt văn bản")
public class ApprovalController {

    private final ApprovalWorkflowService approvalWorkflowService;
    private final UserRepository userRepository;

    private Long resolveUserId(Principal principal) {
        if (principal == null) return null;
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));
        return user.getId();
    }

    /**
     * ADMIN: Tạo workflow template mới
     * POST /api/v1/approvals/workflows
     */
    @PostMapping("/workflows")
    @Operation(summary = "Tạo workflow duyệt mới", description = "Admin tạo template workflow (VD: phê duyệt 3 cấp)")
    public ResponseEntity<?> createWorkflow(
            @RequestBody ApprovalWorkflowDTO request) {
        log.info("Creating new approval workflow: {}", request.getName());
        try {
            ApprovalWorkflowDTO result = approvalWorkflowService.createWorkflow(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            log.error("Error creating workflow: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả workflow trong hệ thống
     * GET /api/v1/approvals/workflows
     */
    @GetMapping("/workflows")
    @Operation(summary = "Lấy danh sách workflow", description = "Hiển thị tất cả workflow template hiện có")
    public ResponseEntity<List<ApprovalWorkflowDTO>> getAllWorkflows() {
        List<ApprovalWorkflowDTO> workflows = approvalWorkflowService.getAllWorkflows();
        return ResponseEntity.ok(workflows);
    }

    /**
     * Lấy workflow theo ID
     * GET /api/v1/approvals/workflows/{id}
     */
    @GetMapping("/workflows/{id}")
    @Operation(summary = "Lấy workflow theo ID")
    public ResponseEntity<ApprovalWorkflowDTO> getWorkflowById(@PathVariable Long id) {
        ApprovalWorkflowDTO workflow = approvalWorkflowService.getWorkflowById(id);
        return ResponseEntity.ok(workflow);
    }

    /**
     * USER: Submit document để duyệt
     * POST /api/v1/approvals/submit
     */
    @PostMapping("/submit")
    @Operation(summary = "Gửi văn bản để duyệt", description = "User chuyển văn bản từ Draft → Review")
    public ResponseEntity<String> submitForApproval(
            @RequestBody SubmitForApprovalDTO request,
            Principal principal) {
        Long userId = resolveUserId(principal);
        log.info("User {} submitting document {} for approval", userId, request.getDocumentId());
        approvalWorkflowService.submitForApproval(request, userId);
        return ResponseEntity.ok("Văn bản đã được gửi duyệt thành công");
    }

    /**
     * APPROVER: Phê duyệt hoặc từ chối document
     * POST /api/v1/approvals/process
     */
    @PostMapping("/process")
    @Operation(summary = "Phê duyệt hoặc từ chối văn bản", description = "Approver xử lý document (approve/reject)")
    public ResponseEntity<String> processApproval(
            @RequestBody ApprovalActionDTO request,
            Principal principal) {
        Long userId = resolveUserId(principal);
        log.info("User {} processing approval for document {}", userId, request.getDocumentId());

        try {
            approvalWorkflowService.processApproval(request, userId);
            String message = Boolean.TRUE.equals(request.getApproved()) ? "Văn bản đã được phê duyệt" : "Văn bản đã bị từ chối";
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Error processing approval: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Lấy lịch sử duyệt của một document
     * GET /api/v1/approvals/documents/{documentId}/history
     */
    @GetMapping("/documents/{documentId}/history")
    @Operation(summary = "Lấy lịch sử duyệt", description = "Xem toàn bộ quá trình duyệt của document")
    public ResponseEntity<List<ApprovalHistoryDTO>> getApprovalHistory(
            @PathVariable Long documentId) {
        List<ApprovalHistoryDTO> history = approvalWorkflowService.getApprovalHistory(documentId);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy danh sách document chờ duyệt của user hiện tại
     * GET /api/v1/approvals/pending
     */
    @GetMapping("/pending")
    @Operation(summary = "Danh sách chờ duyệt", description = "Hiển thị các document đang chờ duyệt của user")
    public ResponseEntity<List<ApprovalHistoryDTO>> getPendingApprovals(
            Principal principal) {
        Long userId = resolveUserId(principal);
        log.info("Fetching pending approvals for user {}", userId);
        List<ApprovalHistoryDTO> pending = approvalWorkflowService.getPendingApprovalsForUser(userId);
        return ResponseEntity.ok(pending);
    }

    /**
     * Lấy lịch sử tất cả các hành động duyệt/từ chối đã thực hiện bởi user hiện tại
     * GET /api/v1/approvals/history
     */
    @GetMapping("/history")
    @Operation(summary = "Lấy lịch sử duyệt cá nhân", description = "Những văn bản mà user đã duyệt hoặc từ chối")
    public ResponseEntity<List<ApprovalHistoryDTO>> getMyApprovalHistory(Principal principal) {
        Long userId = resolveUserId(principal);
        log.info("Fetching processed approval history for user {}", userId);
        List<ApprovalHistoryDTO> history = approvalWorkflowService.getProcessedHistoryForUser(userId);
        return ResponseEntity.ok(history);
    }
}
