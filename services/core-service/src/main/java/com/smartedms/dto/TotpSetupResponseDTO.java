package com.smartedms.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO trả lời khi người dùng yêu cầu OTP qua Microsoft Authenticator.
 * requiresSetup = true  → Lần đầu: cần quét QR Code trong app
 * requiresSetup = false → Đã setup: chỉ cần mở app đọc mã 6 số
 */
@Data
@Builder
public class TotpSetupResponseDTO {

    /** Cần hiện QR Code để setup hay không */
    private boolean requiresSetup;

    /**
     * URI chuẩn otpauth:// để mã hóa thành QR Code.
     * Ví dụ: otpauth://totp/SmartEDMS:user@email.com?secret=BASE32SECRET&issuer=SmartEDMS
     * Chỉ có giá trị khi requiresSetup = true.
     */
    private String qrCodeUri;

    /** Chỉ trả về khi requiresSetup = true, để user có thể nhập thủ công vào app */
    private String secretKey;

    /** success = true nghĩa là backend đã sẵn sàng nhận mã 6 số để verify */
    private boolean success;

    /** Thông điệp thân thiện hiển thị cho user */
    private String message;
}
