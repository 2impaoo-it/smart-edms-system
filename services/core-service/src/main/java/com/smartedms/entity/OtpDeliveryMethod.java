package com.smartedms.entity;

public enum OtpDeliveryMethod {
    EMAIL("Email"),
    SMS("Tin nhắn"),
    MICROSOFT_AUTH("Microsoft Authentication");

    private final String displayName;

    OtpDeliveryMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
