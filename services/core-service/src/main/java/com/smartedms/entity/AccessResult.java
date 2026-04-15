package com.smartedms.entity;

public enum AccessResult {
    SUCCESS("Thành công"),
    FAILED("Thất bại - PIN sai"),
    LOCKED("Bị khóa - Nhập sai quá số lần"),
    INVALID_SESSION("Session không hợp lệ");

    private final String displayName;

    AccessResult(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
