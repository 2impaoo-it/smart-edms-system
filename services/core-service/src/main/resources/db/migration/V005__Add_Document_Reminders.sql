-- Migration: Feature 5 - Document Deadline Reminders
-- Date: 2026-04-02
-- Description: Add document reminder system for nearing deadline notifications

-- =====================================================
-- Tạo bảng document_reminders
-- =====================================================
CREATE TABLE IF NOT EXISTS document_reminders (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    recipient_user_id BIGINT NOT NULL,
    reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('DEADLINE_1_DAY_BEFORE', 'DEADLINE_TODAY', 'OVERDUE')),
    email_address VARCHAR(255),
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'BOUNCED', 'FAILED', 'DUPLICATE')),
    notes TEXT,
    CONSTRAINT fk_reminder_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_reminder_user FOREIGN KEY (recipient_user_id) REFERENCES users(id),
    CONSTRAINT uk_reminder_unique UNIQUE (document_id, recipient_user_id, reminder_type)
);

-- =====================================================
-- Tạo indices
-- =====================================================
CREATE INDEX idx_document_reminders_document ON document_reminders(document_id);
CREATE INDEX idx_document_reminders_user ON document_reminders(recipient_user_id);
CREATE INDEX idx_document_reminders_type ON document_reminders(reminder_type);
CREATE INDEX idx_document_reminders_status ON document_reminders(status);
CREATE INDEX idx_document_reminders_sent_at ON document_reminders(sent_at);

-- =====================================================
-- Thêm deadline_date vào approval_workflows nếu chưa có
-- =====================================================
ALTER TABLE approval_workflows ADD COLUMN IF NOT EXISTS deadline_date DATE;
CREATE INDEX IF NOT EXISTS idx_approval_workflows_deadline ON approval_workflows(deadline_date);
