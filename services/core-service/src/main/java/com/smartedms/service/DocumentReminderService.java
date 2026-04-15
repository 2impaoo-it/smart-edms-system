package com.smartedms.service;

import com.smartedms.entity.*;
import com.smartedms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Document Reminder Service
 * Feature 5: Gửi email nhắc hẹn cho documents nearing deadline
 * - Chạy hàng ngày lúc 8:00 AM
 * - Kiểm tra documents có ngày hết hạn trong 1-2 ngày
 * - Gửi email cho approvers chưa ký
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentReminderService {

    private final DocumentReminderRepository reminderRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${reminder.enabled:true}")
    private boolean reminderEnabled;

    @Value("${reminder.days.before:1}")
    private int daysBeforeDeadline;

    /**
     * Scheduled task chạy hàng ngày lúc 8:00 AM
     * Gửi email nhắc hẹn cho documents nearing deadline
     * Spring Cron cần 6 fields: giây phút giờ ngày tháng thứ (second minute hour day month weekday)
     * Cron: "0 0 8 * * *" = mỗi ngày lúc 08:00:00
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendDeadlineReminders() {
        if (!reminderEnabled) {
            log.info("📧 Document reminders are disabled");
            return;
        }

        log.info("🔔 Starting document deadline reminder task...");

        try {
            // Danh sách tài liệu đang duyệt
            List<Document> reviewDocs = documentRepository.findAll().stream()
                    .filter(doc -> DocumentStatus.REVIEW == doc.getStatus() && doc.getApprovalDueDate() != null)
                    .toList();

            LocalDateTime targetDate = LocalDateTime.now().plusDays(daysBeforeDeadline);

            List<Document> docsNearingDeadline = reviewDocs.stream()
                    .filter(doc -> {
                        LocalDateTime deadline = doc.getApprovalDueDate();
                        // Trễ hạn mức hoặc còn hạn mức <= daysBeforeDeadline thì mới nhắc
                        return deadline.isBefore(targetDate.plusDays(1)) && deadline.isAfter(LocalDateTime.now().minusDays(14));
                    })
                    .toList();

            log.info("Found {} documents nearing deadline", docsNearingDeadline.size());

            for (Document document : docsNearingDeadline) {
                processDocumentReminder(document);
            }

            log.info("✅ Document reminder task completed");
        } catch (Exception e) {
            log.error("❌ Error in reminder task: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi quét dữ liệu: " + e.getMessage());
        }
    }

    /**
     * Xử lý reminder cho một document cụ thể
     */
    private void processDocumentReminder(Document document) {
        // Lấy danh sách ApprovalHistory với status = PENDING thuộc level duyệt hiện tại
        List<ApprovalHistory> pendingHistories = approvalHistoryRepository
                .findByDocumentIdOrderByApprovalLevelAsc(document.getId())
                .stream()
                .filter(h -> h.getStatus() == ApprovalStatus.PENDING && h.getApprovalLevel().equals(document.getCurrentApprovalLevel()))
                .toList();

        log.info("Document {} has {} pending approvers at level {}", document.getId(), pendingHistories.size(), document.getCurrentApprovalLevel());

        for (ApprovalHistory history : pendingHistories) {
            sendReminderToApprover(document, history, ReminderType.DEADLINE_1_DAY_BEFORE);
        }
    }

    /**
     * Gửi email nhắc hẹn cho approver
     */
    @Transactional
    private void sendReminderToApprover(Document document, ApprovalHistory history, ReminderType type) {
        User approver = userRepository.findById(history.getApproverId()).orElse(null);
        if (approver == null || approver.getEmail() == null) {
            log.warn("Approver {} not found or has no email", history.getApproverId());
            return;
        }

        // Kiểm tra reminder đã gửi rồi chưa (tránh duplicate)
        Optional<DocumentReminder> existing = reminderRepository.findExistingReminder(
                document.getId(), type);

        if (existing.isPresent()) {
            log.info("📧 Reminder already sent for document {} to approver {}",
                    document.getId(), approver.getId());
            return;
        }

        try {
            // Gửi email
            emailService.sendDocumentReminderEmail(
                    approver.getEmail(),
                    document.getName(),
                    approver.getFullName());

            // Lưu log reminder
            DocumentReminder reminder = new DocumentReminder();
            reminder.setDocumentId(document.getId());
            reminder.setRecipientUserId(approver.getId());
            reminder.setReminderType(type);
            reminder.setEmailAddress(approver.getEmail());
            reminder.setStatus("SENT");
            reminder.setNotes("Auto-sent reminder");
            reminderRepository.save(reminder);

            log.info("✅ Reminder email sent to {} for document {}",
                    approver.getEmail(), document.getId());

        } catch (Exception e) {
            log.error("❌ Failed to send reminder to {}: {}",
                    approver.getEmail(), e.getMessage());

            // Lưu log failure
            DocumentReminder failedReminder = new DocumentReminder();
            failedReminder.setDocumentId(document.getId());
            failedReminder.setRecipientUserId(approver.getId());
            failedReminder.setReminderType(type);
            failedReminder.setEmailAddress(approver.getEmail());
            failedReminder.setStatus("FAILED");
            failedReminder.setNotes("Failed to send: " + e.getMessage());
            reminderRepository.save(failedReminder);
        }
    }

    /**
     * Gửi email nhắc hẹn CẤP TỐC cho tất cả documents đang chờ duyệt
     */
    @Transactional
    public void sendUrgentReminders() {
        if (!reminderEnabled) {
            log.info("📧 Document reminders are disabled");
            return;
        }

        log.info("🔔 Starting URGENT document reminder task for all pending documents...");

        try {
            List<Document> reviewDocs = documentRepository.findAll().stream()
                    .filter(doc -> DocumentStatus.REVIEW == doc.getStatus())
                    .toList();

            log.info("Found {} documents pending review for urgent reminder", reviewDocs.size());

            for (Document document : reviewDocs) {
                List<ApprovalHistory> pendingHistories = approvalHistoryRepository
                        .findByDocumentIdOrderByApprovalLevelAsc(document.getId())
                        .stream()
                        .filter(h -> h.getStatus() == ApprovalStatus.PENDING && h.getApprovalLevel().equals(document.getCurrentApprovalLevel()))
                        .toList();

                for (ApprovalHistory history : pendingHistories) {
                    sendReminderToApprover(document, history, ReminderType.DEADLINE_TODAY);
                }
            }

            log.info("✅ Urgent document reminder task completed");
        } catch (Exception e) {
            log.error("❌ Error in urgent reminder task: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi quét dữ liệu: " + e.getMessage());
        }
    }

    /**
     * Gửi email nhắc hẹn thủ công (admin)
     */
    @Transactional
    public void sendManualReminder(Long documentId, Long approverUserId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        User approver = userRepository.findById(approverUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            emailService.sendDocumentReminderEmail(
                    approver.getEmail(),
                    document.getName(),
                    approver.getFullName());

            DocumentReminder reminder = new DocumentReminder();
            reminder.setDocumentId(documentId);
            reminder.setRecipientUserId(approverUserId);
            reminder.setReminderType(ReminderType.DEADLINE_1_DAY_BEFORE);
            reminder.setEmailAddress(approver.getEmail());
            reminder.setStatus("SENT");
            reminder.setNotes("Manually triggered reminder");
            reminderRepository.save(reminder);

            log.info("✅ Manual reminder sent to {}", approver.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send manual reminder: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email nhắc hẹn: " + e.getMessage());
        }
    }

    /**
     * Xem lịch sử reminders gửi đến approver
     */
    public List<DocumentReminder> getReminderHistory(Long userId) {
        return reminderRepository.findByRecipientUserIdOrderBySentAtDesc(userId);
    }

    /**
     * Clean up old reminders (chạy hàng tuần lúc 02:00 AM Chủ nhật)
     */
    @Scheduled(cron = "0 0 2 * * 0") // 6 fields: second=0 minute=0 hour=2 day=* month=* weekday=0(CN)
    @Transactional
    public void cleanupOldReminders() {
        log.info("🧹 Cleaning up old reminders...");
        // Xóa reminders cũ hơn 90 ngày để tránh bảng phình to
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        reminderRepository.deleteBySentAtBefore(cutoffDate);
        log.info("✅ Cleanup completed: removed reminders older than 90 days");
    }
}
