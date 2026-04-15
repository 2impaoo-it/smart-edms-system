package com.smartedms.entity;

public enum DocumentStatus {
    // Trạng thái workflow mới (Feature 1: Approval Workflow)
    DRAFT("Nháp"),
    REVIEW("Đang xét duyệt"),       // Đang trong quy trình duyệt (multi-level)
    APPROVE("Chờ phê duyệt"),       // Đã qua hết các level, chờ ký chính thức
    SIGNED("Đã ký"),
    ARCHIVED("Lưu trữ"),
    REJECTED("Từ chối"),

    // Trạng thái cũ – giữ lại để tương thích ngược với DocumentService
    PENDING_APPROVAL("Chờ duyệt"),
    APPROVED("Đã phê duyệt");

    private final String displayName;

    DocumentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
