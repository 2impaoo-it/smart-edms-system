package com.smartedms.repository;

import com.smartedms.entity.SecureAccessLog;
import com.smartedms.entity.AccessResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SecureAccessLogRepository extends JpaRepository<SecureAccessLog, Long> {

        // Lấy log truy cập của user vào folder
        List<SecureAccessLog> findByFolderIdAndUserId(Long folderId, Long userId);

        // Lấy các lần truy cập thất bại gần đây
        List<SecureAccessLog> findByFolderIdAndUserIdAndAccessResultOrderByAccessedAtDesc(
                        Long folderId, Long userId, AccessResult accessResult);

        // Đếm lần sai trong khoảng thời gian
        long countByFolderIdAndUserIdAndAccessResultAndAccessedAtAfter(
                        Long folderId, Long userId, AccessResult accessResult, LocalDateTime since);

        // Lấy toàn bộ log của folder
        List<SecureAccessLog> findByFolderId(Long folderId);
}
