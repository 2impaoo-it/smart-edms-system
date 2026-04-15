package com.smartedms.entity;

/**
 * SEQUENTIAL: các approver phải duyệt lần lượt (1 → 2 → 3)
 * PARALLEL: các approver duyệt cùng lúc (1, 2, 3 song song), tất cả phải
 * approve
 */
public enum ApprovalType {
    SEQUENTIAL("Tuần tự"),
    PARALLEL("Song song");

    private final String displayName;

    ApprovalType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
