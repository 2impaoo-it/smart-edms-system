package com.smartedms.repository;

import com.smartedms.entity.SecureFolder;
import com.smartedms.entity.SecureFolderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecureFolderRepository extends JpaRepository<SecureFolder, Long> {

    // Tìm secure folder theo category
    Optional<SecureFolder> findByCategoryId(Long categoryId);

    // Lấy danh sách secure folders đang hoạt động
    java.util.List<SecureFolder> findByStatus(SecureFolderStatus status);

    // Tìm secure folder theo danh sách id
    java.util.List<SecureFolder> findByCategoryIdIn(java.util.List<Long> categoryIds);
}
