package com.smartedms.entity;

/**
 * Status của digital signature
 */
public enum SignatureStatus {
    VALID("Hợp lệ"),
    REVOKED("Bị thu hồi"),
    EXPIRED("Hết hạn"),
    TAMPERED("Bị giả mạo");

    private final String displayName;

    SignatureStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
