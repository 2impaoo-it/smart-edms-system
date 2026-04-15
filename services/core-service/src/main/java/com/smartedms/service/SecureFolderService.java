package com.smartedms.service;

import com.smartedms.dto.SecureFolderDTO;
import com.smartedms.dto.SecureAccessLogDTO;
import com.smartedms.entity.*;
import com.smartedms.repository.SecureFolderRepository;
import com.smartedms.repository.SecureAccessLogRepository;
import com.smartedms.repository.UserRepository;
import com.smartedms.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service xử lý PIN Protection cho Secure Folders
 * Cho dù user có quyền vẫn phải nhập PIN để truy cập
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SecureFolderService {

    private final SecureFolderRepository secureFolderRepository;
    private final SecureAccessLogRepository accessLogRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Tạo secure folder với PIN
     */
    @Transactional
    public SecureFolderDTO createSecureFolder(Long categoryId, String pin, String description) {
        log.info("Creating secure folder for category {}", categoryId);

        // Validate PIN: 4-6 digits
        if (!isValidPin(pin)) {
            throw new IllegalArgumentException("PIN phải từ 4-6 chữ số");
        }

        // Kiểm tra category không được setup PIN lần 2
        Optional<SecureFolder> existing = secureFolderRepository.findByCategoryId(categoryId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Thư mục này đã được setup PIN rồi");
        }

        SecureFolder folder = new SecureFolder();
        folder.setCategoryId(categoryId);
        folder.setPinHash(passwordEncoder.encode(pin));
        folder.setStatus(SecureFolderStatus.ACTIVE);
        folder.setDescription(description);
        folder.setMaxFailedAttempts(5);
        folder.setLockoutDurationMinutes(15);

        SecureFolder saved = secureFolderRepository.save(folder);
        log.info("Secure folder created with ID: {}", saved.getId());

        return toDTO(saved);
    }

    /**
     * Xác minh PIN trước khi cho truy cập folder
     *
     * @return true nếu PIN đúng, false nếu sai
     * @throws SecurityException nếu folder bị khóa
     */
    @Transactional
    public boolean verifyPin(Long categoryId, String pin, Long userId,
            String ipAddress, String userAgent) {
        log.info("User {} attempting to access folder for category {}", userId, categoryId);

        SecureFolder folder = secureFolderRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Secure folder không tồn tại cho thư mục này"));

        // Check if folder is locked
        if (folder.getStatus() == SecureFolderStatus.LOCKED) {
            LocalDateTime unlockTime = folder.getLastLockedAt()
                    .plusMinutes(folder.getLockoutDurationMinutes());
            if (LocalDateTime.now().isBefore(unlockTime)) {
                log.warn("Folder ID: {} is locked", folder.getId());
                recordAccessLog(folder.getId(), userId, AccessResult.LOCKED,
                        "Thư mục bị khóa", ipAddress, userAgent);
                throw new SecurityException("Thư mục bị khóa. Vui lòng thử lại sau.");
            } else {
                // Unlock folder
                folder.setStatus(SecureFolderStatus.ACTIVE);
                secureFolderRepository.save(folder);
            }
        }

        // Verify PIN
        boolean isPinCorrect = passwordEncoder.matches(pin, folder.getPinHash());

        if (isPinCorrect) {
            log.info("✅ PIN correct for user {} on category {}", userId, categoryId);
            recordAccessLog(folder.getId(), userId, AccessResult.SUCCESS, null, ipAddress, userAgent);
            return true;
        } else {
            log.warn("❌ PIN incorrect for user {} on category {}", userId, categoryId);
            recordAccessLog(folder.getId(), userId, AccessResult.FAILED, "PIN sai", ipAddress, userAgent);

            // Kiểm tra số lần sai
            long failedAttempts = countRecentFailedAttempts(folder.getId(), userId);
            if (failedAttempts >= folder.getMaxFailedAttempts()) {
                folder.setStatus(SecureFolderStatus.LOCKED);
                folder.setLastLockedAt(LocalDateTime.now());
                secureFolderRepository.save(folder);
                log.warn("❌ Folder ID: {} locked after {} failed attempts", folder.getId(), failedAttempts);
                throw new SecurityException("Nhập PIN sai quá " + folder.getMaxFailedAttempts()
                        + " lần. Thư mục bị khóa trong " + folder.getLockoutDurationMinutes() + " phút.");
            }

            return false;
        }
    }

    /**
     * Đổi PIN (Admin hoặc folder owner)
     */
    @Transactional
    public void changePin(Long categoryId, String oldPin, String newPin) {
        SecureFolder folder = secureFolderRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Secure folder không tồn tại"));

        // Verify old PIN
        if (!passwordEncoder.matches(oldPin, folder.getPinHash())) {
            throw new SecurityException("PIN cũ không đúng");
        }

        if (!isValidPin(newPin)) {
            throw new IllegalArgumentException("PIN phải từ 4-6 chữ số");
        }

        folder.setPinHash(passwordEncoder.encode(newPin));
        secureFolderRepository.save(folder);
        log.info("PIN changed for category {}", categoryId);
    }

    /**
     * Reset PIN (Admin only)
     */
    @Transactional
    public void resetPin(Long categoryId, String newPin) {
        SecureFolder folder = secureFolderRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Secure folder không tồn tại"));

        if (!isValidPin(newPin)) {
            throw new IllegalArgumentException("PIN phải từ 4-6 chữ số");
        }

        folder.setPinHash(passwordEncoder.encode(newPin));
        folder.setStatus(SecureFolderStatus.ACTIVE);
        folder.setLastLockedAt(null);
        secureFolderRepository.save(folder);
        log.info("PIN reset for category {} by admin", categoryId);
    }

    /**
     * Lấy danh sách access logs của folder theo categoryId
     */
    public List<SecureAccessLogDTO> getAccessLogs(Long categoryId) {
        SecureFolder folder = secureFolderRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Secure folder không tồn tại"));
        return accessLogRepository.findByFolderId(folder.getId())
                .stream()
                .map(this::toAccessLogDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin secure folder theo categoryId
     */
    public SecureFolderDTO getSecureFolder(Long categoryId) {
        SecureFolder folder = secureFolderRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Secure folder không tồn tại"));
        return toDTO(folder);
    }

    /**
     * Lấy danh sách tất cả secure folders
     */
    public List<SecureFolderDTO> getAllSecureFolders() {
        return secureFolderRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Disable secure folder theo categoryId
     */
    @Transactional
    public void disableSecureFolder(Long categoryId) {
        SecureFolder folder = secureFolderRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Secure folder không tồn tại"));
        folder.setStatus(SecureFolderStatus.DISABLED);
        secureFolderRepository.save(folder);
        log.info("Secure folder for category {} disabled", categoryId);
    }

    // ========== PRIVATE METHODS ==========

    private boolean isValidPin(String pin) {
        return pin != null && pin.matches("\\d{4,6}");
    }

    private long countRecentFailedAttempts(Long folderId, Long userId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        return accessLogRepository.countByFolderIdAndUserIdAndAccessResultAndAccessedAtAfter(
                folderId, userId, AccessResult.FAILED, oneHourAgo);
    }

    private void recordAccessLog(Long folderId, Long userId, AccessResult result,
            String failureReason, String ipAddress, String userAgent) {
        SecureAccessLog log = new SecureAccessLog();
        log.setFolderId(folderId);
        log.setUserId(userId);
        log.setAccessResult(result);
        log.setFailureReason(failureReason);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        accessLogRepository.save(log);
    }

    private SecureFolderDTO toDTO(SecureFolder entity) {
        Category category = categoryRepository.findById(entity.getCategoryId()).orElse(null);
        boolean isLocked = entity.getStatus() == SecureFolderStatus.LOCKED;
        long timeUntilUnlock = 0;
        if (isLocked && entity.getLastLockedAt() != null) {
            LocalDateTime unlockTime = entity.getLastLockedAt()
                    .plusMinutes(entity.getLockoutDurationMinutes());
            timeUntilUnlock = java.time.temporal.ChronoUnit.SECONDS.between(LocalDateTime.now(), unlockTime);
        }

        return SecureFolderDTO.builder()
                .id(entity.getId())
                .categoryId(entity.getCategoryId())
                .categoryName(category != null ? category.getName() : "N/A")
                .status(entity.getStatus())
                .maxFailedAttempts(entity.getMaxFailedAttempts())
                .lockoutDurationMinutes(entity.getLockoutDurationMinutes())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .lastLockedAt(entity.getLastLockedAt())
                .isLocked(isLocked)
                .timeUntilUnlockSeconds(Math.max(0, timeUntilUnlock))
                .build();
    }

    private SecureAccessLogDTO toAccessLogDTO(SecureAccessLog entity) {
        User user = userRepository.findById(entity.getUserId()).orElse(null);
        return SecureAccessLogDTO.builder()
                .id(entity.getId())
                .folderId(entity.getFolderId())
                .userId(entity.getUserId())
                .userName(user != null ? user.getFullName() : "N/A")
                .accessResult(entity.getAccessResult())
                .failureReason(entity.getFailureReason())
                .ipAddress(entity.getIpAddress())
                .accessedAt(entity.getAccessedAt())
                .build();
    }
}
