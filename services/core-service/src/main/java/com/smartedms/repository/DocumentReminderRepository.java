package com.smartedms.repository;

import com.smartedms.entity.DocumentReminder;
import com.smartedms.entity.ReminderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentReminderRepository extends JpaRepository<DocumentReminder, Long> {

    // Tìm reminder hiện tại
    Optional<DocumentReminder> findByDocumentIdAndRecipientUserIdAndReminderType(
            Long documentId, Long userId, ReminderType reminderType);

    // Lấy tất cả reminders chưa gửi cho document
    List<DocumentReminder> findByDocumentIdAndStatus(Long documentId, String status);

    // Lấy reminders gửi gần đây cho user
    List<DocumentReminder> findByRecipientUserIdOrderBySentAtDesc(Long userId);

    @Query("SELECT dr FROM DocumentReminder dr WHERE dr.documentId = :docId AND dr.reminderType = :type AND dr.status = 'SENT'")
    Optional<DocumentReminder> findExistingReminder(@Param("docId") Long docId, @Param("type") ReminderType type);

    // Xóa các reminders cũ hơn ngày cutoff (dùng cho cleanup task)
    void deleteBySentAtBefore(LocalDateTime cutoffDate);
}
