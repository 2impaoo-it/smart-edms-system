package com.smartedms.repository;

import com.smartedms.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByFolderIdAndIsDeletedFalse(Long folderId);

    List<Document> findByFolderId(Long folderId);

    List<Document> findByApproverIdAndStatusAndIsDeletedFalse(Long approverId, com.smartedms.entity.DocumentStatus status);

    @Query("SELECT d FROM Document d WHERE d.isDeleted = false AND " +
           "(:folderId IS NULL OR d.folderId = :folderId) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:name IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Document> searchDocuments(@Param("name") String name, 
                                   @Param("folderId") Long folderId, 
                                   @Param("status") com.smartedms.entity.DocumentStatus status, 
                                   Pageable pageable);

    List<Document> findByIsDeletedTrue();

    long countByStatus(com.smartedms.entity.DocumentStatus status);
}
