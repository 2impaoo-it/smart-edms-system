-- Migration: Support Multi-Level Digital Signatures
-- Date: 2026-04-02
-- Description: Add support for multi-level digital signatures in approval workflow

-- =====================================================
-- Tạo bảng digital_signatures
-- =====================================================
CREATE TABLE IF NOT EXISTS digital_signatures (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    signer_id BIGINT NOT NULL,
    approval_level INTEGER NOT NULL,
    signature_data TEXT NOT NULL,
    document_hash VARCHAR(512),
    certificate_id BIGINT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('VALID', 'REVOKED', 'EXPIRED', 'TAMPERED')),
    signer_ip VARCHAR(45),
    signer_user_agent TEXT,
    signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    timestamp_token TEXT,
    CONSTRAINT fk_sig_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_sig_signer FOREIGN KEY (signer_id) REFERENCES users(id),
    CONSTRAINT uk_sig_document_level UNIQUE (document_id, approval_level)
);

-- =====================================================
-- Tạo indices
-- =====================================================
CREATE INDEX idx_digital_signatures_document ON digital_signatures(document_id);
CREATE INDEX idx_digital_signatures_signer ON digital_signatures(signer_id);
CREATE INDEX idx_digital_signatures_status ON digital_signatures(status);
CREATE INDEX idx_digital_signatures_level ON digital_signatures(document_id, approval_level);

-- =====================================================
-- Thêm cột keystores cho users (nếu cần)
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS keystore_data BYTEA;
ALTER TABLE users ADD COLUMN IF NOT EXISTS keystore_password_hash VARCHAR(512);

-- =====================================================
-- Sample Data (nếu cần)
-- =====================================================
-- INSERT INTO digital_signatures (document_id, signer_id, approval_level, signature_data, status)
-- VALUES (1, 1, 1, 'base64_encoded_signature', 'VALID');
