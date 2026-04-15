package com.smartedms.dto;

import com.smartedms.entity.SecureFolderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecureFolderDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private SecureFolderStatus status;
    private Integer maxFailedAttempts;
    private Integer lockoutDurationMinutes;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime lastLockedAt;
    private boolean isLocked;
    private long timeUntilUnlockSeconds; // Thời gian còn lại cho đến khi unlock (nếu đang khóa)
}
