-- Migration: Create Approval Workflow Tables
-- Date: 2026-04-02
-- Description: Tạo các table cho workflow duyệt văn bản (Draft → Review → Approve → Signed → Archived)

-- =====================================================
-- 1. Thêm cột mới vào bảng documents
-- =====================================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS approval_workflow_id BIGINT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS current_approval_level INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS approval_due_date TIMESTAMP;

-- =====================================================
-- 2. Tạo bảng approval_workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_workflows (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    approval_type VARCHAR(50) NOT NULL CHECK (approval_type IN ('SEQUENTIAL', 'PARALLEL')),
    completion_days_limit INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_workflow_name UNIQUE (name)
);

-- =====================================================
-- 3. Tạo bảng approval_levels
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_levels (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    level_order INTEGER NOT NULL,
    level_name VARCHAR(255) NOT NULL,
    approver_id BIGINT NOT NULL,
    description TEXT,
    CONSTRAINT fk_level_workflow FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_level_approver FOREIGN KEY (approver_id) REFERENCES users(id),
    CONSTRAINT uk_level_order UNIQUE (workflow_id, level_order)
);

-- =====================================================
-- 4. Tạo bảng approval_histories
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_histories (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    approval_level INTEGER NOT NULL,
    approver_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RECALLED')),
    rejection_reason TEXT,
    comments TEXT,
    reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_approver FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- =====================================================
-- 5. Tạo indices
-- =====================================================
CREATE INDEX idx_approval_workflows_active ON approval_workflows(is_active);
CREATE INDEX idx_approval_levels_workflow ON approval_levels(workflow_id);
CREATE INDEX idx_approval_histories_document ON approval_histories(document_id);
CREATE INDEX idx_approval_histories_approver ON approval_histories(approver_id);
CREATE INDEX idx_approval_histories_status ON approval_histories(status);
CREATE INDEX idx_approval_histories_level ON approval_histories(document_id, approval_level);
CREATE INDEX idx_documents_workflow ON documents(approval_workflow_id);
CREATE INDEX idx_documents_current_level ON documents(current_approval_level);

-- =====================================================
-- 6. Cập nhật DocumentStatus enum (nếu cần)
-- =====================================================
-- PostgreSQL không quản lý enum trong SQL migrations
-- Enum sẽ được quản lý từ code Spring Boot

-- =====================================================
-- Sample Data: Tạo workflow template "Phê duyệt 3 cấp"
-- =====================================================
-- Lưu ý: Thay USER_ID_1, USER_ID_2, USER_ID_3 bằng ID thực tế của users
-- INSERT INTO approval_workflows (name, description, approval_type, completion_days_limit, is_active)
-- VALUES ('Phê duyệt 3 cấp', 'Workflow tiêu chuẩn: Quản lý → Giám đốc → Tổng giám đốc', 'SEQUENTIAL', 7, true);

-- INSERT INTO approval_levels (workflow_id, level_order, level_name, approver_id, description)
-- SELECT id, 1, 'Quản lý bộ phận', USER_ID_1, 'Cấp duyệt thứ nhất' FROM approval_workflows WHERE name = 'Phê duyệt 3 cấp'
-- UNION ALL
-- SELECT id, 2, 'Giám đốc', USER_ID_2, 'Cấp duyệt thứ hai' FROM approval_workflows WHERE name = 'Phê duyệt 3 cấp'
-- UNION ALL
-- SELECT id, 3, 'Tổng giám đốc', USER_ID_3, 'Cấp duyệt cuối cùng' FROM approval_workflows WHERE name = 'Phê duyệt 3 cấp';
