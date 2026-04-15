package com.smartedms.service;

import com.smartedms.dto.ApprovalActionDTO;
import com.smartedms.dto.ApprovalHistoryDTO;
import com.smartedms.dto.ApprovalLevelDTO;
import com.smartedms.dto.ApprovalWorkflowDTO;
import com.smartedms.dto.SubmitForApprovalDTO;
import com.smartedms.entity.*;
import com.smartedms.repository.ApprovalHistoryRepository;
import com.smartedms.repository.ApprovalWorkflowRepository;
import com.smartedms.repository.DocumentRepository;
import com.smartedms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý toàn bộ logic workflow duyệt văn bản
 * Draft → Review → Approve → Signed → Archived
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalWorkflowService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final ApprovalHistoryRepository historyRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    /**
     * User submit document để duyệt
     * Chuyển trạng thái từ DRAFT → REVIEW
     * Tạo ApprovalHistory cho level 1
     */
    @Transactional
    public void submitForApproval(SubmitForApprovalDTO request, Long userId) {
        log.info("User {} submit document {} for approval", userId, request.getDocumentId());

        Document doc = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Chỉ DRAFT document mới có thể submit
        if (DocumentStatus.DRAFT != doc.getStatus()) {
            throw new RuntimeException("Chỉ văn bản ở trạng thái Nháp mới có thể gửi duyệt");
        }

        // Lấy workflow
        ApprovalWorkflow workflow = workflowRepository.findById(request.getApprovalWorkflowId())
                .orElseThrow(() -> new RuntimeException("Approval workflow not found"));

        // Cập nhật document
        doc.setStatus(DocumentStatus.REVIEW);
        doc.setApprovalWorkflowId(workflow.getId());
        
        // Tránh NPE do autounboxing null integer
        long daysLimit = workflow.getCompletionDaysLimit() != null ? workflow.getCompletionDaysLimit() : 7L;
        doc.setApprovalDueDate(LocalDateTime.now().plusDays(daysLimit));
        
        List<ApprovalLevel> levels = workflow.getApprovalLevels().stream()
                .sorted(Comparator.comparingInt(ApprovalLevel::getLevelOrder))
                .collect(Collectors.toList());
        if (!levels.isEmpty()) {
            doc.setCurrentApprovalLevel(levels.get(0).getLevelOrder());
            doc.setApproverId(levels.get(0).getApproverId());
        } else {
            throw new RuntimeException("Workflow không có cấu hình cấp duyệt nào");
        }
        
        documentRepository.save(doc);

        // Theo cấu hình yêu cầu ký số từ frontend
        List<SubmitForApprovalDTO.LevelOverride> overrides = request.getLevelOverrides();

        // Tạo ApprovalHistory entries cho mỗi level
        for (ApprovalLevel level : levels) {
            ApprovalHistory history = new ApprovalHistory();
            history.setDocumentId(doc.getId());
            history.setApprovalLevel(level.getLevelOrder());
            history.setApproverId(level.getApproverId());
            history.setStatus(ApprovalStatus.PENDING);
            
            // Cài đặt cấu hình Ký số từ overrides hoặc mặc định là false
            boolean reqSign = false;
            if (overrides != null) {
                reqSign = overrides.stream()
                        .filter(ov -> ov.getLevelOrder() != null && ov.getLevelOrder().equals(level.getLevelOrder()))
                        .map(ov -> Boolean.TRUE.equals(ov.getRequireSignature()))
                        .findFirst()
                        .orElse(false);
            }
            history.setRequireSignature(reqSign);

            historyRepository.save(history);
            log.info("Created approval history for level {}, approver {} (requiring signature: {})", level.getLevelOrder(),
                    level.getApproverId(), reqSign);
        }

        // Đổi trạng thái Document sang PENDING_APPROVAL
        doc.setStatus(com.smartedms.entity.DocumentStatus.PENDING_APPROVAL);
        documentRepository.save(doc);

        log.info("Document {} submitted for approval successfully", request.getDocumentId());
    }

    /**
     * Approver phê duyệt hoặc từ chối document
     */
    @Transactional
    public void processApproval(ApprovalActionDTO request, Long userId) {
        log.info("User {} process approval for document {}: approved={}", userId, request.getDocumentId(),
                request.getApproved());

        Document doc = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Lấy approval history hiện tại (dùng findFirst để tránh lỗi khi người dùng submit lại nhiều lần)
        ApprovalHistory currentApproval = historyRepository.findFirstByDocumentIdAndApprovalLevelOrderByIdDesc(
                doc.getId(),
                doc.getCurrentApprovalLevel());

        if (currentApproval == null) {
            throw new RuntimeException("Approval not found for current level");
        }

        // Kiểm tra user có quyền duyệt cấp này không
        if (!currentApproval.getApproverId().equals(userId)) {
            throw new RuntimeException("You are not the approver for this level");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            // ✅ APPROVED
            currentApproval.setStatus(ApprovalStatus.APPROVED);
            currentApproval.setComments(request.getComments());
            historyRepository.save(currentApproval);

            // Kiểm tra có level tiếp theo không
            ApprovalWorkflow workflow = workflowRepository.findById(doc.getApprovalWorkflowId())
                    .orElseThrow();

            List<ApprovalLevel> levels = workflow.getApprovalLevels().stream()
                    .sorted(Comparator.comparingInt(ApprovalLevel::getLevelOrder))
                    .collect(Collectors.toList());

            Integer currentLevelOrder = doc.getCurrentApprovalLevel();
            int currentIndex = -1;
            for (int i = 0; i < levels.size(); i++) {
                if (levels.get(i).getLevelOrder().equals(currentLevelOrder)) {
                    currentIndex = i;
                    break;
                }
            }

            if (currentIndex >= 0 && currentIndex < levels.size() - 1) {
                // Chuyển sang level tiếp theo
                ApprovalLevel nextLevel = levels.get(currentIndex + 1);
                doc.setCurrentApprovalLevel(nextLevel.getLevelOrder());
                doc.setStatus(DocumentStatus.REVIEW);
                doc.setApproverId(nextLevel.getApproverId());
                
                documentRepository.save(doc);
                log.info("Document {} moved to approval level {}", doc.getId(), nextLevel.getLevelOrder());
            } else {
                // Đã qua tất cả levels → APPROVE (chờ ký chính thức)
                doc.setStatus(DocumentStatus.APPROVE);
                // Sau khi xong flow, approverId có thể giữ nguyên người cuối hoặc set null tùy business, 
                // ở đây giữ người cuối để họ có thể thực hiện bước ký cuối.
                documentRepository.save(doc);
                log.info("Document {} completed all approval levels, waiting for signature", doc.getId());
            }
        } else {
            // ❌ REJECTED
            if (request.getRejectionReason() == null || request.getRejectionReason().isEmpty()) {
                throw new RuntimeException("Rejection reason is required");
            }

            // Lưu level hiện tại trước khi set null để log chính xác
            Integer rejectedLevel = doc.getCurrentApprovalLevel();

            currentApproval.setStatus(ApprovalStatus.REJECTED);
            currentApproval.setRejectionReason(request.getRejectionReason());
            currentApproval.setComments(request.getComments());
            historyRepository.save(currentApproval);

            // Chuyển về DRAFT để người dùng có thể chỉnh sửa và gửi lại
            doc.setStatus(DocumentStatus.DRAFT);
            doc.setRejectionReason(request.getRejectionReason());
            doc.setCurrentApprovalLevel(null);
            documentRepository.save(doc);
            log.info("Document {} rejected at level {}", doc.getId(), rejectedLevel);
        }
    }

    /**
     * Lấy lịch sử duyệt của một document
     */
    public List<ApprovalHistoryDTO> getApprovalHistory(Long documentId) {
        return historyRepository.findByDocumentIdOrderByApprovalLevelAsc(documentId)
                .stream()
                .map(this::toApprovalHistoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách document chờ duyệt của một user
     */
    public List<ApprovalHistoryDTO> getPendingApprovalsForUser(Long userId) {
        return historyRepository.findByApproverIdAndStatus(userId, ApprovalStatus.PENDING)
                .stream()
                .map(this::toApprovalHistoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử đã phê duyệt/từ chối của một user
     */
    public List<ApprovalHistoryDTO> getProcessedHistoryForUser(Long userId) {
        return historyRepository.findProcessedApprovalsForUser(userId)
                .stream()
                .map(this::toApprovalHistoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tạo workflow mới
     */
    @Transactional
    public ApprovalWorkflowDTO createWorkflow(ApprovalWorkflowDTO request) {
        ApprovalWorkflow workflow = new ApprovalWorkflow();
        workflow.setName(request.getName());
        workflow.setDescription(request.getDescription());
        workflow.setApprovalType(request.getApprovalType());
        workflow.setCompletionDaysLimit(request.getCompletionDaysLimit());
        workflow.setActive(true);

        // Lưu bản ghi cha trước để lấy ID
        ApprovalWorkflow savedParent = workflowRepository.save(workflow);

        // Map và gán workflowId thật cho từng level
        List<ApprovalLevel> levels = request.getApprovalLevels().stream()
                .map(dto -> {
                    ApprovalLevel level = new ApprovalLevel();
                    level.setLevelOrder(dto.getLevelOrder());
                    level.setLevelName(dto.getLevelName());
                    level.setApproverId(dto.getApproverId());
                    level.setDescription(dto.getDescription());
                    level.setWorkflowId(savedParent.getId()); // ID thật
                    return level;
                })
                .collect(Collectors.toList());

        savedParent.setApprovalLevels(levels);
        ApprovalWorkflow finalSaved = workflowRepository.save(savedParent);

        return toWorkflowDTO(finalSaved);
    }

    /**
     * Lấy tất cả workflow
     */
    public List<ApprovalWorkflowDTO> getAllWorkflows() {
        return workflowRepository.findByActiveTrue().stream()
                .map(this::toWorkflowDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy workflow theo ID
     */
    public ApprovalWorkflowDTO getWorkflowById(Long id) {
        return workflowRepository.findById(id)
                .map(this::toWorkflowDTO)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
    }

    /**
     * Mapping ApprovalHistory → DTO
     */
    private ApprovalHistoryDTO toApprovalHistoryDTO(ApprovalHistory entity) {
        User approver = userRepository.findById(entity.getApproverId()).orElse(null);
        Document doc = documentRepository.findById(entity.getDocumentId()).orElse(null);
        return ApprovalHistoryDTO.builder()
                .id(entity.getId())
                .documentId(entity.getDocumentId())
                .documentName(doc != null ? doc.getName() : "Unknown Document")
                .approvalLevel(entity.getApprovalLevel())
                .approverId(entity.getApproverId())
                .approverName(approver != null ? approver.getFullName() : "N/A")
                .approverJobTitle(approver != null ? approver.getJobTitle() : "N/A")
                .status(entity.getStatus())
                .rejectionReason(entity.getRejectionReason())
                .comments(entity.getComments())
                .requireSignature(entity.getRequireSignature())
                .reviewedAt(entity.getReviewedAt())
                .build();
    }

    /**
     * Mapping ApprovalWorkflow → DTO
     */
    private ApprovalWorkflowDTO toWorkflowDTO(ApprovalWorkflow entity) {
        List<ApprovalLevelDTO> levels = entity.getApprovalLevels().stream()
                .map(level -> {
                    User approver = userRepository.findById(level.getApproverId()).orElse(null);
                    return ApprovalLevelDTO.builder()
                            .id(level.getId())
                            .levelOrder(level.getLevelOrder())
                            .levelName(level.getLevelName())
                            .approverId(level.getApproverId())
                            .approverName(approver != null ? approver.getFullName() : "N/A")
                            .approverJobTitle(approver != null ? approver.getJobTitle() : "N/A")
                            .description(level.getDescription())
                            .build();
                })
                .collect(Collectors.toList());

        return ApprovalWorkflowDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .approvalType(entity.getApprovalType())
                .approvalLevels(levels)
                .completionDaysLimit(entity.getCompletionDaysLimit())
                .isActive(Boolean.TRUE.equals(entity.getActive())) // field đổi từ isActive → active
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
