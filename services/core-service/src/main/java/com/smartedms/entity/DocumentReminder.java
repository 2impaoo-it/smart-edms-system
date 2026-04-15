package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * DocumentReminder: Ghi nhận các email nhắc hẹn đã gửi
 * Để tránh spam: chỉ gửi 1 email nhắc hẹn cho 1 document, 1 user
 */
@Entity
@Table(name = "document_reminders")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Document cần ký
    @Column(name = "document_id", nullable = false)
    private Long documentId;

    // Người nhận reminder (approver)
    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    // Loại reminder: DEADLINE_1_DAY_BEFORE, DEADLINE_TODAY
    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false)
    private ReminderType reminderType = ReminderType.DEADLINE_1_DAY_BEFORE;

    // Email đã gửi
    @Column(name = "email_address")
    private String emailAddress;

    // Lúc gửi
    @CreatedDate
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    // Status
    @Column(name = "status")
    private String status = "SENT"; // SENT, BOUNCED, FAILED, DUPLICATE

    // Ghi chú
    @Column(name = "notes")
    private String notes;
}
