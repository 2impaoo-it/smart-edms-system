-- Migration: Feature 4 - OTP Authentication
-- Date: 2026-04-02
-- Description: Add OTP support for multi-factor auth and digital certificate creation

-- =====================================================
-- Tạo bảng otp_tokens
-- =====================================================
CREATE TABLE IF NOT EXISTS otp_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('DIGITAL_CERT_CREATION', 'SIGNATURE', 'PASSWORD_RESET', 'TWO_FACTOR_AUTH')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'USED', 'BLOCKED')),
    delivery_method VARCHAR(50) NOT NULL CHECK (delivery_method IN ('EMAIL', 'SMS', 'MICROSOFT_AUTH')),
    delivery_address VARCHAR(255) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    microsoft_auth_code VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    request_ip VARCHAR(45),
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_otp_pending UNIQUE (user_id, purpose, status) WHERE status = 'PENDING'
);

-- =====================================================
-- Tạo indices
-- =====================================================
CREATE INDEX idx_otp_user ON otp_tokens(user_id);
CREATE INDEX idx_otp_purpose ON otp_tokens(purpose);
CREATE INDEX idx_otp_status ON otp_tokens(status);
CREATE INDEX idx_otp_created_at ON otp_tokens(created_at);
CREATE INDEX idx_otp_expires_at ON otp_tokens(expires_at);
CREATE INDEX idx_otp_otp_code ON otp_tokens(otp_code);
