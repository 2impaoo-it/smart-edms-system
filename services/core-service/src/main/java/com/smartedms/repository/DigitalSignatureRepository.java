package com.smartedms.repository;

import com.smartedms.entity.DigitalSignature;
import com.smartedms.entity.SignatureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalSignatureRepository extends JpaRepository<DigitalSignature, Long> {

    // Lấy tất cả chữ ký của một document
    List<DigitalSignature> findByDocumentIdOrderByApprovalLevelAsc(Long documentId);

    // Lấy chữ ký tại một cấp cụ thể
    DigitalSignature findByDocumentIdAndApprovalLevel(Long documentId, Integer approvalLevel);

    // Lấy chữ ký của một người ký
    List<DigitalSignature> findBySignerId(Long signerId);

    // Lấy chữ ký hợp lệ của document
    List<DigitalSignature> findByDocumentIdAndStatus(Long documentId, SignatureStatus status);

    // Đếm chữ ký hợp lệ
    long countByDocumentIdAndStatus(Long documentId, SignatureStatus status);

    // Tìm chữ ký theo certificate ID
    DigitalSignature findByCertificateId(Long certificateId);
}
