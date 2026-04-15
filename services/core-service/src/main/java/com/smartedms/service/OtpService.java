package com.smartedms.service;

import com.smartedms.dto.GenerateOtpDTO;
import com.smartedms.dto.OtpTokenDTO;
import com.smartedms.dto.TotpSetupResponseDTO;
import com.smartedms.dto.VerifyOtpDTO;
import com.smartedms.entity.*;
import com.smartedms.repository.OtpTokenRepository;
import com.smartedms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

/**
 * OTP Service – hỗ trợ 2 cơ chế:
 *  1. EMAIL        – Gửi mã 6 số ngẫu nhiên qua email, lưu bảng otp_tokens
 *  2. MICROSOFT_AUTH – TOTP chuẩn RFC 6238, tính realtime bằng HmacSHA1, không lưu DB
 *
 * TOTP được implement thuần Java (javax.crypto.Mac) – không cần thư viện ngoài.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${otp.expiration.minutes:10}")
    private int otpExpirationMinutes;

    @Value("${otp.max.attempts:3}")
    private int maxAttempts;

    // Tên hiển thị trong app Authenticator
    private static final String TOTP_ISSUER = "SmartEDMS";

    // Chuỗi ký tự hợp lệ của Base32
    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    // =====================================================================
    //  PUBLIC API
    // =====================================================================

    /**
     * Tạo / khởi động OTP.
     * - MICROSOFT_AUTH → Kiểm tra setup, trả về QR hoặc sẵn sàng verify
     * - EMAIL          → Gửi mã ngẫu nhiên qua email
     */
    @Transactional
    public Object generateOtp(GenerateOtpDTO request, String requestIp) {
        log.info("Generate OTP – userId={} | purpose={} | method={}",
                request.getUserId(), request.getPurpose(), request.getDeliveryMethod());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getDeliveryMethod() == OtpDeliveryMethod.MICROSOFT_AUTH) {
            return handleTotpGenerate(user);
        }

        return handleEmailOtp(request, user, requestIp);
    }

    /**
     * Xác minh mã OTP người dùng nhập.
     * - MICROSOFT_AUTH → verify TOTP bằng thuật toán RFC 6238
     * - EMAIL          → verify qua bảng otp_tokens
     */
    @Transactional
    public boolean verifyOtp(VerifyOtpDTO request) {
        log.info("Verify OTP – userId={} | purpose={} | method={}",
                request.getUserId(), request.getPurpose(), request.getDeliveryMethod());

        if ("MICROSOFT_AUTH".equalsIgnoreCase(request.getDeliveryMethod())) {
            return verifyTotpCode(request.getUserId(), request.getOtpCode());
        }

        return verifyEmailOtp(request);
    }

    /**
     * Xác nhận setup TOTP lần đầu (sau khi quét QR).
     * Nếu mã đúng → lưu mfaEnabled = true.
     */
    @Transactional
    public TotpSetupResponseDTO confirmTotpSetup(Long userId, String otpCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (user.getMfaSecret() == null) {
            throw new RuntimeException("Chưa có secret. Vui lòng yêu cầu QR Code trước.");
        }

        if (!verifyTotpCode(userId, otpCode)) {
            log.warn("❌ TOTP confirm thất bại – userId={}", userId);
            throw new SecurityException("Mã xác thực sai. Kiểm tra lại ứng dụng Microsoft Authenticator.");
        }

        user.setMfaEnabled(true);
        userRepository.save(user);
        log.info("✅ TOTP setup xác nhận thành công – userId={}", userId);

        return TotpSetupResponseDTO.builder()
                .requiresSetup(false)
                .success(true)
                .message("Đã liên kết Microsoft Authenticator thành công!")
                .build();
    }

    /**
     * Lấy status OTP hiện tại (dùng cho EMAIL)
     */
    public OtpTokenDTO getOtpStatus(Long userId, String purpose) {
        Optional<OtpToken> otp = otpRepository.findByUserIdAndStatusAndPurpose(
                userId, OtpStatus.PENDING, OtpPurpose.valueOf(purpose));
        return otp.map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("OTP không tìm thấy hoặc đã được dùng"));
    }

    /**
     * Dọn dẹp OTP hết hạn mỗi giờ
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredOtps() {
        log.info("Dọn dẹp OTP hết hạn...");
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    // =====================================================================
    //  PRIVATE – TOTP  (RFC 6238 / RFC 4226, thuần Java, không thư viện ngoài)
    // =====================================================================

    /**
     * Xử lý generate cho MICROSOFT_AUTH:
     * - Chưa có secret → tạo mới + trả về QR URI
     * - Đã có secret + mfaEnabled → báo sẵn sàng nhập mã
     */
    private TotpSetupResponseDTO handleTotpGenerate(User user) {
        if (user.getMfaSecret() == null) {
            String secret = generateBase32Secret();
            user.setMfaSecret(secret);
            user.setMfaEnabled(false);
            userRepository.save(user);
            log.info("✅ Tạo MFA secret mới – userId={}", user.getId());
        }

        if (!user.isMfaEnabled()) {
            String qrCodeUri = buildOtpAuthUri(user.getEmail(), user.getMfaSecret());
            return TotpSetupResponseDTO.builder()
                    .requiresSetup(true)
                    .qrCodeUri(qrCodeUri)
                    .secretKey(user.getMfaSecret())
                    .success(true)
                    .message("Quét mã QR bằng Microsoft Authenticator để thiết lập.")
                    .build();
        }

        log.info("ℹ️ userId={} đã setup MFA, sẵn sàng verify", user.getId());
        return TotpSetupResponseDTO.builder()
                .requiresSetup(false)
                .success(true)
                .message("Mở Microsoft Authenticator và nhập mã 6 số.")
                .build();
    }

    /**
     * Xác minh mã TOTP nhập vào so với secret trong DB.
     * Cho phép lệch ±1 chu kỳ 30s để bù trừ sai lệch đồng hồ thiết bị.
     */
    private boolean verifyTotpCode(Long userId, String inputCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (user.getMfaSecret() == null) {
            log.warn("❌ userId={} chưa có MFA secret", userId);
            return false;
        }

        try {
            byte[] secretBytes = base32Decode(user.getMfaSecret());
            long currentWindow = System.currentTimeMillis() / 1000L / 30L;

            // Thử cửa sổ hiện tại và ±2 (tổng 5 cửa sổ × 30s = cho phép lệch ±60s)
            for (int offset = -2; offset <= 2; offset++) {
                String expected = generateHotp(secretBytes, currentWindow + offset, 6);
                if (expected.equals(inputCode.trim())) {
                    log.info("✅ TOTP verify thành công (offset={}) – userId={}", offset, userId);
                    return true;
                }
            }

            log.warn("❌ TOTP sai mã – userId={}", userId);
            return false;
        } catch (Exception e) {
            log.error("Lỗi verify TOTP – userId={}: {}", userId, e.getMessage());
            return false;
        }
    }

    /**
     * Thuật toán HOTP (RFC 4226):
     * 1. HMAC-SHA1(secret, counter_as_8_bytes)
     * 2. Dynamic Truncation → số nguyên
     * 3. Modulo 10^digits → mã OTP
     */
    private String generateHotp(byte[] secret, long counter, int digits)
            throws NoSuchAlgorithmException, InvalidKeyException {

        // Bước 1: Chuyển counter thành mảng 8 bytes big-endian
        byte[] counterBytes = ByteBuffer.allocate(8).putLong(counter).array();

        // Bước 2: HMAC-SHA1
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(secret, "HmacSHA1"));
        byte[] hash = mac.doFinal(counterBytes);

        // Bước 3: Dynamic truncation – lấy 4 bytes từ offset xác định bởi 4 bit cuối
        int offset = hash[hash.length - 1] & 0x0F;
        int truncated = ((hash[offset]     & 0x7F) << 24)
                      | ((hash[offset + 1] & 0xFF) << 16)
                      | ((hash[offset + 2] & 0xFF) << 8)
                      |  (hash[offset + 3] & 0xFF);

        // Bước 4: Modulo và format thành chuỗi có đủ số 0 đứng đầu
        int otp = truncated % (int) Math.pow(10, digits);
        return String.format("%0" + digits + "d", otp);
    }

    /**
     * Xây dựng chuỗi otpauth:// chuẩn để mã hóa thành QR Code.
     * Ref: https://github.com/google/google-authenticator/wiki/Key-Uri-Format
     */
    private String buildOtpAuthUri(String accountEmail, String base32Secret) {
        String encodedLabel  = URLEncoder.encode(TOTP_ISSUER + ":" + accountEmail, StandardCharsets.UTF_8);
        String encodedIssuer = URLEncoder.encode(TOTP_ISSUER, StandardCharsets.UTF_8);
        return String.format(
                "otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                encodedLabel, base32Secret, encodedIssuer
        );
    }

    /**
     * Tạo secret 20 bytes ngẫu nhiên và encode thành Base32 (yêu cầu của chuẩn TOTP).
     */
    private String generateBase32Secret() {
        byte[] bytes = new byte[20];
        new SecureRandom().nextBytes(bytes);
        return base32Encode(bytes);
    }

    /**
     * Encode bytes → Base32 string (alphabet A-Z + 2-7, không có padding).
     */
    private String base32Encode(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0, bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                bitsLeft -= 5;
                result.append(BASE32_ALPHABET.charAt((buffer >> bitsLeft) & 31));
            }
        }
        if (bitsLeft > 0) {
            result.append(BASE32_ALPHABET.charAt((buffer << (5 - bitsLeft)) & 31));
        }
        return result.toString();
    }

    /**
     * Decode Base32 string → bytes (cần để đưa vào HmacSHA1).
     */
    private byte[] base32Decode(String base32) {
        String upper = base32.toUpperCase().replaceAll("[^A-Z2-7]", "");
        int byteCount = (upper.length() * 5) / 8;
        byte[] result = new byte[byteCount];
        int buffer = 0, bitsLeft = 0, idx = 0;
        for (char c : upper.toCharArray()) {
            int val = BASE32_ALPHABET.indexOf(c);
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bitsLeft -= 8;
                if (idx < byteCount) result[idx++] = (byte) (buffer >> bitsLeft);
            }
        }
        return result;
    }

    // =====================================================================
    //  PRIVATE – EMAIL OTP (giữ nguyên logic cũ)
    // =====================================================================

    private OtpTokenDTO handleEmailOtp(GenerateOtpDTO request, User user, String requestIp) {
        // Xóa OTP cũ PENDING cùng purpose
        otpRepository.findByUserIdAndStatusAndPurpose(
                request.getUserId(), OtpStatus.PENDING, request.getPurpose())
                .ifPresent(otpRepository::delete);

        String otpCode = generateRandomOtp();

        OtpToken token = new OtpToken();
        token.setUserId(request.getUserId());
        token.setOtpCode(otpCode);
        token.setPurpose(request.getPurpose());
        token.setStatus(OtpStatus.PENDING);
        token.setDeliveryMethod(request.getDeliveryMethod());
        token.setDeliveryAddress(request.getDeliveryAddress());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        token.setAttemptCount(0);
        token.setRequestIp(requestIp);

        OtpToken saved = otpRepository.save(token);
        sendEmailOtp(saved, user);
        log.info("✅ Email OTP gửi → {}", maskEmail(user.getEmail()));
        return toDTO(saved);
    }

    private boolean verifyEmailOtp(VerifyOtpDTO request) {
        Optional<OtpToken> otpOpt = otpRepository.findByUserIdAndStatusAndPurpose(
                request.getUserId(), OtpStatus.PENDING, OtpPurpose.valueOf(request.getPurpose()));

        if (otpOpt.isEmpty()) {
            log.warn("❌ Không có OTP pending – userId={}", request.getUserId());
            return false;
        }

        OtpToken otp = otpOpt.get();

        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            otp.setStatus(OtpStatus.EXPIRED);
            otpRepository.save(otp);
            log.warn("❌ OTP hết hạn");
            return false;
        }

        if (otp.getAttemptCount() >= maxAttempts) {
            otp.setStatus(OtpStatus.BLOCKED);
            otpRepository.save(otp);
            throw new SecurityException("Quá số lần thử. OTP bị chặn.");
        }

        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            log.warn("❌ Sai mã OTP. Lần thử: {}", otp.getAttemptCount());
            return false;
        }

        otp.setStatus(OtpStatus.VERIFIED);
        otp.setVerifiedAt(LocalDateTime.now());
        otpRepository.save(otp);
        log.info("✅ Email OTP verify thành công");
        return true;
    }

    private void sendEmailOtp(OtpToken otp, User user) {
        String subject = "Mã OTP xác thực – " + otp.getPurpose().getDisplayName();
        String body = String.format(
                "Xin chào %s,\n\nMã OTP xác thực của bạn là: %s\n\n" +
                "Mã này sẽ hết hạn trong %d phút.\n\n" +
                "Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email này.\n\n" +
                "Đây là email tự động, vui lòng không trả lời.",
                user.getFullName(), otp.getOtpCode(), otpExpirationMinutes);
        try {
            emailService.sendEmail(otp.getDeliveryAddress(), subject, body);
            log.info("✅ Email OTP đã gửi → {}", maskEmail(otp.getDeliveryAddress()));
        } catch (Exception e) {
            log.error("Gửi email OTP thất bại: {}", e.getMessage());
            throw new RuntimeException("Gửi OTP qua email thất bại. Vui lòng thử lại.");
        }
    }

    private String generateRandomOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    private String maskEmail(String email) {
        if (email == null) return "***";
        String[] parts = email.split("@");
        if (parts[0].length() <= 3) return parts[0].charAt(0) + "***@" + parts[1];
        return parts[0].substring(0, 3) + "***@" + parts[1];
    }

    private OtpTokenDTO toDTO(OtpToken entity) {
        LocalDateTime now = LocalDateTime.now();
        long secondsRemaining = java.time.temporal.ChronoUnit.SECONDS.between(now, entity.getExpiresAt());
        return OtpTokenDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .purpose(entity.getPurpose())
                .status(entity.getStatus())
                .deliveryMethod(entity.getDeliveryMethod().name())
                .maskedDeliveryAddress(maskEmail(entity.getDeliveryAddress()))
                .attemptCount(entity.getAttemptCount())
                .createdAt(entity.getCreatedAt())
                .expiresAt(entity.getExpiresAt())
                .timeRemainingSeconds(Math.max(0, secondsRemaining))
                .isExpired(now.isAfter(entity.getExpiresAt()))
                .build();
    }
}
