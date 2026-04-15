-- Migration: Feature 3 - PIN Protection for Secure Folders
-- Date: 2026-04-02
-- Description: Add PIN protection to folders - encore user must enter PIN even if they have access permission

-- =====================================================
-- Tạo bảng secure_folders
-- =====================================================
CREATE TABLE IF NOT EXISTS secure_folders (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL UNIQUE,
    pin_hash VARCHAR(512) NOT NULL,
    max_failed_attempts INTEGER NOT NULL DEFAULT 5,
    lockout_duration_minutes INTEGER NOT NULL DEFAULT 15,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'LOCKED', 'DISABLED')),
    last_locked_at TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_secure_folder_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- =====================================================
-- Tạo bảng secure_access_logs (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS secure_access_logs (
    id BIGSERIAL PRIMARY KEY,
    folder_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    access_result VARCHAR(50) NOT NULL CHECK (access_result IN ('SUCCESS', 'FAILED', 'LOCKED', 'INVALID_SESSION')),
    failure_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_folder FOREIGN KEY (folder_id) REFERENCES secure_folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- Tạo indices
-- =====================================================
CREATE INDEX idx_secure_folders_status ON secure_folders(status);
CREATE INDEX idx_secure_access_logs_folder ON secure_access_logs(folder_id);
CREATE INDEX idx_secure_access_logs_user ON secure_access_logs(user_id);
CREATE INDEX idx_secure_access_logs_result ON secure_access_logs(access_result);
CREATE INDEX idx_secure_access_logs_accessed_at ON secure_access_logs(accessed_at);
