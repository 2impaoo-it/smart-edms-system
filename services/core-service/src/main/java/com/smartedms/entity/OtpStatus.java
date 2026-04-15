package com.smartedms.entity;

public enum OtpStatus {
    PENDING("Chờ xác minh"),
    VERIFIED("Đã xác minh"),
    EXPIRED("Đã hết hạn"),
    USED("Đã dùng"),
    BLOCKED("Bị chặn - quá số lần");

    private final String displayName;

    OtpStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
