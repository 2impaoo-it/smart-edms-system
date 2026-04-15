package com.smartedms.entity;

public enum ReminderType {
    DEADLINE_1_DAY_BEFORE("Nhắc hẹn trước 1 ngày"),
    DEADLINE_TODAY("Nhắc hẹn trực tiếp (Cấp tốc)"),
    OVERDUE("Quá hạn");

    private final String displayName;

    ReminderType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
