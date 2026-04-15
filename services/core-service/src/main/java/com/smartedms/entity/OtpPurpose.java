package com.smartedms.entity;

public enum OtpPurpose {
    DIGITAL_CERT_CREATION("Tạo chứng thư số"),
    SIGNATURE("Ký chứng thư"),
    PASSWORD_RESET("Đặt lại mật khẩu"),
    TWO_FACTOR_AUTH("Xác thực 2 yếu tố");

    private final String displayName;

    OtpPurpose(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
