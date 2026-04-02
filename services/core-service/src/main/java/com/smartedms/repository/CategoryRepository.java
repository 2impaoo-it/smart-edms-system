package com.smartedms.repository;

import com.smartedms.entity.Category;
import com.smartedms.entity.FolderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByIdAndDeletedFalse(Long id);

    List<Category> findByParentIdAndDeletedFalse(Long parentId);

    List<Category> findByParentId(Long parentId);

    List<Category> findByOwnerIdAndFolderTypeAndParentIdIsNullAndDeletedFalse(Long ownerId, FolderType folderType);

    List<Category> findByOwnerIdAndDeletedFalse(Long ownerId);

    List<Category> findByParentIdAndFolderTypeAndDeletedFalse(Long parentId, FolderType folderType);

    List<Category> findByParentIdAndOwnerIdAndFolderTypeAndDeletedFalse(Long parentId, Long ownerId, FolderType folderType);

    List<Category> findByOwnerIdAndDeletedTrue(Long ownerId);

    List<Category> findByDeletedTrue();
}

