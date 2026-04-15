package com.smartedms.entity;

/**
 * Status của mỗi approval action
 * PENDING: chưa xét duyệt
 * APPROVED: đã phê duyệt
 * REJECTED: đã từ chối
 */
public enum ApprovalStatus {
    PENDING("Chờ xét duyệt"),
    APPROVED("Đã phê duyệt"),
    REJECTED("Từ chối"),
    RECALLED("Thu hồi");

    private final String displayName;

    ApprovalStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
