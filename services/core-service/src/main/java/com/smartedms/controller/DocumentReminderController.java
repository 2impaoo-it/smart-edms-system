package com.smartedms.controller;

import com.smartedms.entity.DocumentReminder;
import com.smartedms.service.DocumentReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API Controller cho Document Reminders
 * Endpoint: /api/v1/reminders
 *
 * Feature 5: Email Reminder cho documents nearing deadline
 * - Tự động gửi email hàng ngày lúc 8:00 AM
 * - Manual trigger reminder
 * - Xem lịch sử reminders
 */
@RestController
@RequestMapping("/api/v1/reminders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Document Reminders", description = "Quản lý email nhắc hẹn cho documents sắp hết hạn")
public class DocumentReminderController {

    private final DocumentReminderService reminderService;

    /**
     * Gửi reminder thủ công (Admin only)
     * POST /api/v1/reminders/send-manual
     *
     * Body: {
     * "documentId": 1,
     * "approverUserId": 2
     * }
     */
    @PostMapping("/send-manual")
    @Operation(summary = "Gửi email nhắc hẹn thủ công", description = "Admin trigger reminder ngay lập tức")
    public ResponseEntity<Map<String, Object>> sendManualReminder(
            @RequestParam Long documentId,
            @RequestParam Long approverUserId) {
        try {
            reminderService.sendManualReminder(documentId, approverUserId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ Email nhắc hẹn đã được gửi");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending manual reminder: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "❌ " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Xem lịch sử reminders của user
     * GET /api/v1/reminders/history/{userId}
     */
    @GetMapping("/history/{userId}")
    @Operation(summary = "Xem lịch sử reminders nhận được", description = "Danh sách emails nhắc hẹn đã gửi")
    public ResponseEntity<Map<String, Object>> getReminderHistory(@PathVariable Long userId) {
        try {
            List<DocumentReminder> history = reminderService.getReminderHistory(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", history);
            response.put("count", history.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "❌ " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Trigger reminder task ngay lập tức (Admin/Debug only)
     * POST /api/v1/reminders/trigger-now
     *
     * CẢNH BÁO: Chỉ dùng cho testing/debugging
     */
    @PostMapping("/trigger-now")
    @Operation(summary = "Trigger reminder task ngay", description = "⚠️ Admin/Debug only")
    public ResponseEntity<Map<String, Object>> triggerReminderNow() {
        try {
            reminderService.sendUrgentReminders();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ Reminder task triggered thành công");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "❌ " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Thống kê reminders
     * GET /api/v1/reminders/stats
     */
    @GetMapping("/stats")
    @Operation(summary = "Thống kê reminders", description = "Xem tình trạng reminders")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> response = new HashMap<>();
        response.put("feature", "Document Deadline Reminders");
        response.put("status", "✅ Active");
        response.put("frequency", "Daily at 08:00 AM");
        response.put("leadTime", "1 day before deadline");
        response.put("description", "Automatically sends email reminders to approvers for documents nearing deadline");

        return ResponseEntity.ok(response);
    }
}
