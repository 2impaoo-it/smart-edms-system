package com.smartedms.dto;

import com.smartedms.entity.AccessResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecureAccessLogDTO {
    private Long id;
    private Long folderId;
    private Long userId;
    private String userName;
    private AccessResult accessResult;
    private String failureReason;
    private String ipAddress;
    private LocalDateTime accessedAt;
}
