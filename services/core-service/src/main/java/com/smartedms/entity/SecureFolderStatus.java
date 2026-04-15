package com.smartedms.entity;

public enum SecureFolderStatus {
    ACTIVE("Đang hoạt động"),
    LOCKED("Bị khóa"),
    DISABLED("Đã vô hiệu hóa");

    private final String displayName;

    SecureFolderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
