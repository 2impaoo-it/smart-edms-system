package com.smartedms.service;

import com.smartedms.entity.Category;
import com.smartedms.entity.Document;
import com.smartedms.entity.DocumentVersion;
import com.smartedms.entity.PermissionLevel;
import com.smartedms.repository.CategoryRepository;
import com.smartedms.repository.DocumentRepository;
import com.smartedms.repository.DocumentVersionRepository;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.MinioException;
import io.minio.messages.Item;
import io.minio.Result;
import io.minio.GetObjectResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;
import java.util.List;

@Service
public class DocumentService {

    private final CategoryRepository categoryRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final MinioClient minioClient;
    private final String defaultBucket;
    private final FolderPermissionService permissionService;
    private final DocumentConverterService converterService;
    private final AuditLogPublisherService auditLogPublisherService;

    public DocumentService(
            CategoryRepository categoryRepository,
            DocumentRepository documentRepository,
            DocumentVersionRepository documentVersionRepository,
            MinioClient minioClient,
            @Value("${minio.bucket}") String defaultBucket,
            FolderPermissionService permissionService,
            DocumentConverterService converterService,
            AuditLogPublisherService auditLogPublisherService) {
        this.categoryRepository = categoryRepository;
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.minioClient = minioClient;
        this.defaultBucket = defaultBucket;
        this.permissionService = permissionService;
        this.converterService = converterService;
        this.auditLogPublisherService = auditLogPublisherService;
    }

    public List<Document> getByFolderId(Long folderId) {
        return documentRepository.findByFolderIdAndDeletedFalse(folderId);
    }

    @Transactional
    public void softDelete(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
        checkDeletePermission(document, userId);

        document.setDeleted(true);
        documentRepository.save(document);

        // Audit log – fault tolerant: không để lỗi SecurityContext rollback thao tác xóa
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            auditLogPublisherService.publishLog(com.smartedms.dto.AuditLogRequest.builder()
                    .actorName(username)
                    .action("DELETE_DOCUMENT")
                    .entityType("DOCUMENT")
                    .entityId(document.getId())
                    .details(java.util.Map.of("name", document.getName()))
                    .build());
        } catch (Exception e) {
            System.err.println("Audit log failed for DELETE_DOCUMENT id=" + id + ": " + e.getMessage());
        }
    }

    @Transactional
    public Document restoreDocument(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
        checkDeletePermission(document, userId);

        if (!document.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài liệu này không nằm trong thùng rác");
        }
        document.setDeleted(false);
        document = documentRepository.save(document);

        // Audit log – fault tolerant
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            auditLogPublisherService.publishLog(com.smartedms.dto.AuditLogRequest.builder()
                    .actorName(username)
                    .action("RESTORE_DOCUMENT")
                    .entityType("DOCUMENT")
                    .entityId(document.getId())
                    .build());
        } catch (Exception e) {
            System.err.println("Audit log failed for RESTORE_DOCUMENT id=" + id + ": " + e.getMessage());
        }

        return document;
    }

    @Transactional
    public void hardDeleteDocument(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
        checkDeletePermission(document, userId);
        
        List<DocumentVersion> versions = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(id);
        for (DocumentVersion version : versions) {
            try {
                StorageLocation location = resolveLocation(version.getFilePath());
                minioClient.removeObject(io.minio.RemoveObjectArgs.builder()
                        .bucket(location.bucket())
                        .object(location.objectKey())
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to delete file from MinIO: " + version.getFilePath());
            }
            documentVersionRepository.delete(version);
        }
        documentRepository.delete(document);
    }

    public List<Document> getDeletedDocuments() {
        return documentRepository.findByDeletedTrue();
    }

    @Transactional
    public void emptyAllTrash() {
        // EmptyAllTrash là admin operation - xóa trực tiếp không qua permission check cá nhân
        List<Document> deletedDocs = documentRepository.findByDeletedTrue();
        for (Document doc : deletedDocs) {
            List<DocumentVersion> versions = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(doc.getId());
            for (DocumentVersion version : versions) {
                try {
                    StorageLocation location = resolveLocation(version.getFilePath());
                    minioClient.removeObject(io.minio.RemoveObjectArgs.builder()
                            .bucket(location.bucket())
                            .object(location.objectKey())
                            .build());
                } catch (Exception e) {
                    System.err.println("Failed to delete file from MinIO during emptyTrash: " + version.getFilePath());
                }
                documentVersionRepository.delete(version);
            }
            documentRepository.delete(doc);
        }

        // Audit log – fault tolerant
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            auditLogPublisherService.publishLog(com.smartedms.dto.AuditLogRequest.builder()
                    .actorName(username)
                    .action("EMPTY_ALL_TRASH")
                    .entityType("SYSTEM")
                    .entityId(0L)
                    .build());
        } catch (Exception e) {
            System.err.println("Audit log failed for EMPTY_ALL_TRASH: " + e.getMessage());
        }
    }

    public long getSystemStorageUsage() {
        long totalSize = 0;
        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                    io.minio.ListObjectsArgs.builder().bucket(defaultBucket).recursive(true).build());
            for (Result<Item> result : results) {
                totalSize += result.get().size();
            }
        } catch (Exception e) {
            System.err.println("Failed to get MinIO storage usage: " + e.getMessage());
        }
        return totalSize;
    }

    public org.springframework.data.domain.Page<Document> searchDocuments(String keyword, Long folderId, com.smartedms.entity.DocumentStatus status, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        // Repository dùng @Param("name") nên truyền keyword vào đúng vị trí tham số name
        return documentRepository.searchDocuments(keyword, folderId, status, pageable);
    }

    @Transactional
    public Document submitForApproval(Long documentId, Long approverId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (document.getStatus() != com.smartedms.entity.DocumentStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ tài liệu DRAFT mới có thể trình ký");
        }

        // Bỏ qua check quyền nếu ở thư mục cá nhân root
        if (document.getFolderId() != null && !permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.EDITOR)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền trình ký tài liệu này");
        }

        // Kiểm tra approver: User quản lý được chọn có tồn tại không
        if (approverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn Quản lý để phê duyệt");
        }

        document.setStatus(com.smartedms.entity.DocumentStatus.PENDING_APPROVAL);
        document.setApproverId(approverId);
        return documentRepository.save(document);
    }

    @Transactional
    public Document renameDocument(Long documentId, String newName, Long userId) {
        Document document = documentRepository.findById(documentId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (document.getFolderId() != null && !permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.EDITOR)) {
            // Nếu không có quyền EDITOR ở thư mục phòng ban
            if (!userId.equals(document.getCreatedBy())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền đổi tên tài liệu này");
            }
        } else if (document.getFolderId() == null) {
            // Document root
            if (!userId.equals(document.getCreatedBy())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền đổi tên tài liệu của người khác");
            }
        }

        // Xử lý đuôi if missing extension
        String safeName = getSafePdfName(newName);
        if (!newName.toLowerCase().endsWith(".pdf") && !newName.toLowerCase().matches(".*\\.(docx|doc|xlsx|xls|pptx|ppt)$")) {
             document.setName(safeName);
        } else {
             document.setName(newName);
        }

        return documentRepository.save(document);
    }

    @Transactional
    public Document rejectDocument(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (!userId.equals(document.getApproverId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người duyệt mới có quyền từ chối");
        }

        document.setStatus(com.smartedms.entity.DocumentStatus.REJECTED);
        return documentRepository.save(document);
    }

    @Transactional
    public Document approveDocument(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (!userId.equals(document.getApproverId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người duyệt mới có quyền phê duyệt");
        }

        if (document.getStatus() != com.smartedms.entity.DocumentStatus.PENDING_APPROVAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài liệu không ở trạng thái chờ duyệt");
        }

        document.setStatus(com.smartedms.entity.DocumentStatus.APPROVED);
        document = documentRepository.save(document);

        DocumentVersion currentVersion = documentVersionRepository.findByDocumentIdAndIsCurrentTrue(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document version not found"));

        DocumentVersion newVersion = new DocumentVersion();
        newVersion.setDocumentId(document.getId());
        newVersion.setVersionNumber(currentVersion.getVersionNumber() + 1);
        newVersion.setFilePath(currentVersion.getFilePath());
        newVersion.setCreatedBy(userId);
        newVersion.setCurrent(true);

        currentVersion.setCurrent(false);
        documentVersionRepository.save(currentVersion);
        documentVersionRepository.save(newVersion);

        // Audit log – fault tolerant
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            auditLogPublisherService.publishLog(com.smartedms.dto.AuditLogRequest.builder()
                    .actorId(userId)
                    .actorName(username)
                    .action("APPROVE_DOCUMENT")
                    .entityType("DOCUMENT")
                    .entityId(document.getId())
                    .details(java.util.Map.of("name", document.getName()))
                    .build());
        } catch (Exception e) {
            System.err.println("Audit log failed for APPROVE_DOCUMENT id=" + documentId + ": " + e.getMessage());
        }

        return document;
    }

    public List<Document> getPendingApprovals(Long approverId) {
        return documentRepository.findByApproverIdAndStatusAndDeletedFalse(approverId, com.smartedms.entity.DocumentStatus.PENDING_APPROVAL);
    }

    @Transactional
    public Document uploadPdf(MultipartFile file, Long folderId, Long userId) {
        validateSupportedFormat(file);
        
        // CHỈNH SỬA: Cấm upload lên root theo yêu cầu của user
        if (folderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn thư mục. Không được phép upload tài liệu lên thư mục gốc.");
        }
        
        validateFolder(folderId);

        // Kiểm tra quyền EDITOR trên thư mục đích
        if (!permissionService.hasMinimumPermission(userId, folderId, PermissionLevel.EDITOR)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền upload vào thư mục này");
        }

        try {
            byte[] finalFileBytes;
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            
            if (extension.equals(".pdf")) {
                finalFileBytes = file.getBytes();
            } else {
                finalFileBytes = converterService.convertToPdf(file);
            }
            
            String safePdfName = getSafePdfName(originalFileName);
            String storedFileName = buildStoredFileName(safePdfName);
            String objectKey = buildObjectKey(folderId, storedFileName);

            // Kiểm tra và đảm bảo bucket tồn tại
            if (defaultBucket == null || defaultBucket.isBlank()) {
                throw new IllegalStateException("MinIO bucket name is not configured in application.properties");
            }
            ensureBucketExists(defaultBucket);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(defaultBucket)
                            .object(objectKey)
                            .stream(new java.io.ByteArrayInputStream(finalFileBytes), finalFileBytes.length, -1)
                            .contentType(MediaType.APPLICATION_PDF_VALUE)
                            .build());

            Document document = new Document();
            document.setName(safePdfName);
            document.setFolderId(folderId);
            document.setDeleted(false);
            document = documentRepository.save(document);

            DocumentVersion version = new DocumentVersion();
            version.setDocumentId(document.getId());
            version.setVersionNumber(1);
            version.setFilePath(defaultBucket + "/" + objectKey);
            version.setCreatedBy(userId);
            version.setCurrent(true);
            documentVersionRepository.save(version);

            // Audit log – fault tolerant
            try {
                String username = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName();
                auditLogPublisherService.publishLog(com.smartedms.dto.AuditLogRequest.builder()
                        .actorId(userId)
                        .actorName(username)
                        .action("UPLOAD_DOCUMENT")
                        .entityType("DOCUMENT")
                        .entityId(document.getId())
                        .details(java.util.Map.of("name", document.getName(), "folderId", folderId != null ? folderId : 0))
                        .build());
            } catch (Exception auditEx) {
                System.err.println("Audit log failed for UPLOAD_DOCUMENT id=" + document.getId() + ": " + auditEx.getMessage());
            }

            return document;
        } catch (MinioException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload PDF to MinIO", exception);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload document", exception);
        }
    }

    @Transactional
    public DocumentVersion uploadNewVersion(Long documentId, MultipartFile file, Long userId) {
        validateSupportedFormat(file);
        
        Document document = documentRepository.findById(documentId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (document.getFolderId() != null && !permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.EDITOR)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật tài liệu này");
        }

        List<DocumentVersion> oldVersions = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId);
        for (DocumentVersion v : oldVersions) {
            if (v.isCurrent()) {
                v.setCurrent(false);
                documentVersionRepository.save(v);
            }
        }

        int nextVersion = oldVersions.isEmpty() ? 1 : oldVersions.get(0).getVersionNumber() + 1;

        try {
            byte[] finalFileBytes;
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            
            if (extension.equals(".pdf")) {
                finalFileBytes = file.getBytes();
            } else {
                finalFileBytes = converterService.convertToPdf(file);
            }
            
            String safePdfName = getSafePdfName(originalFileName);
            String storedFileName = buildStoredFileName(safePdfName);
            String objectKey = buildObjectKey(document.getFolderId(), storedFileName);

            ensureBucketExists(defaultBucket);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(defaultBucket)
                            .object(objectKey)
                            .stream(new java.io.ByteArrayInputStream(finalFileBytes), finalFileBytes.length, -1)
                            .contentType(MediaType.APPLICATION_PDF_VALUE)
                            .build());

            DocumentVersion newVersion = new DocumentVersion();
            newVersion.setDocumentId(document.getId());
            newVersion.setVersionNumber(nextVersion);
            newVersion.setFilePath(defaultBucket + "/" + objectKey);
            newVersion.setCreatedBy(userId);
            newVersion.setCurrent(true);
            newVersion = documentVersionRepository.save(newVersion);

            // Audit log – fault tolerant
            try {
                String username = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName();
                auditLogPublisherService.publishLog(com.smartedms.dto.AuditLogRequest.builder()
                        .actorId(userId)
                        .actorName(username)
                        .action("UPLOAD_NEW_VERSION")
                        .entityType("DOCUMENT")
                        .entityId(document.getId())
                        .details(java.util.Map.of("name", document.getName(), "versionNumber", newVersion.getVersionNumber()))
                        .build());
            } catch (Exception auditEx) {
                System.err.println("Audit log failed for UPLOAD_NEW_VERSION docId=" + document.getId() + ": " + auditEx.getMessage());
            }

            return newVersion;
        } catch (MinioException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload PDF to MinIO", exception);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload document version", exception);
        }
    }

    public ResponseEntity<InputStreamResource> streamPdf(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (document.getFolderId() != null && !permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.VIEWER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem tài liệu này");
        }

        DocumentVersion currentVersion = documentVersionRepository.findByDocumentIdAndIsCurrentTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document version not found"));

        return streamPdfFromLocation(currentVersion.getFilePath(), document.getName(), document);
    }

    public ResponseEntity<InputStreamResource> streamPdfVersion(Long documentId, Long versionId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (document.getFolderId() != null && !permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.VIEWER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem tài liệu này");
        }

        DocumentVersion version = documentVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document version not found"));

        if (!version.getDocumentId().equals(documentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Version does not belong to this document");
        }

        return streamPdfFromLocation(version.getFilePath(), document.getName(), document);
    }

    public List<DocumentVersion> getVersionHistory(Long documentId) {
        return documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId);
    }

    private ResponseEntity<InputStreamResource> streamPdfFromLocation(String filePath, String fileName, Document document) {
        StorageLocation location = resolveLocation(filePath);

        try {
            StatObjectResponse objectStat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(location.bucket())
                            .object(location.objectKey())
                            .build());

            String contentType = objectStat.contentType();
            if (!isPdf(contentType, document)) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                        "Document is not a PDF file");
            }

            GetObjectResponse stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(location.bucket())
                            .object(location.objectKey())
                            .build());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());
            if (objectStat.size() >= 0) {
                headers.setContentLength(objectStat.size());
            }

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(stream));
        } catch (ErrorResponseException exception) {
            if ("NoSuchKey".equalsIgnoreCase(exception.errorResponse().code())
                    || "NoSuchBucket".equalsIgnoreCase(exception.errorResponse().code())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Stored PDF file not found", exception);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to access MinIO storage", exception);
        } catch (MinioException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to access MinIO storage", exception);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to stream document", exception);
        }
    }

    private void checkDeletePermission(Document document, Long userId) {
        // Khi userId null (ví dụ từ admin operation) thì chỉ dùng SecurityContext
        if (userId == null) {
            boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getAuthorities()
                    .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền thực hiện thao tác này");
            }
            return;
        }

        if (document.getFolderId() != null) {
            if (!permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.EDITOR)) {
                if (!userId.equals(document.getCreatedBy())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên tài liệu này");
                }
            }
        } else {
            if (!userId.equals(document.getCreatedBy())) {
                boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getAuthorities()
                        .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên tài liệu của người khác");
                }
            }
        }
    }

    private void ensureBucketExists(String bucketName) throws Exception {
        boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build());
        if (!bucketExists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    private void validateSupportedFormat(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài liệu trống");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên tài liệu trống");
        }

        String normalizedFileName = originalFileName.toLowerCase(Locale.ROOT);
        if (!normalizedFileName.matches(".*\\.(pdf|docx|doc|xlsx|xls|pptx|ppt)$")) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Chỉ hỗ trợ PDF hoặc Microsoft Office (Word, Excel, PowerPoint)");
        }
    }

    private String getSafePdfName(String originalName) {
        if (originalName == null) return "document.pdf";
        int lastDotIndex = originalName.lastIndexOf(".");
        if (lastDotIndex != -1) {
            return originalName.substring(0, lastDotIndex) + ".pdf";
        }
        return originalName + ".pdf";
    }

    private void validateFolder(Long folderId) {
        if (folderId == null) {
            return;
        }

        Category category = categoryRepository.findById(folderId)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        if (category.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found");
        }
    }

    private String buildObjectKey(Long folderId, String storedFileName) {
        LocalDate today = LocalDate.now();
        String folderSegment = folderId == null ? "root" : "folder-" + folderId;
        return "documents/"
                + folderSegment + "/"
                + today.getYear() + "/"
                + String.format("%02d", today.getMonthValue()) + "/"
                + storedFileName;
    }

    private String buildStoredFileName(String originalFileName) {
        String sanitizedName = sanitizeFileName(originalFileName);
        return UUID.randomUUID() + "-" + sanitizedName;
    }

    private String sanitizeFileName(String originalFileName) {
        return originalFileName.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private boolean isPdf(String contentType, Document document) {
        if (contentType != null && !contentType.isBlank()) {
            return MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType);
        }

        String fileName = document.getName();
        return fileName != null && fileName.toLowerCase().endsWith(".pdf");
    }

    private StorageLocation resolveLocation(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document storage path is empty");
        }

        String normalizedPath = filePath.trim();
        if (normalizedPath.startsWith("s3://") || normalizedPath.startsWith("minio://")) {
            int schemeSeparatorIndex = normalizedPath.indexOf("://") + 3;
            String withoutScheme = normalizedPath.substring(schemeSeparatorIndex);
            int slashIndex = withoutScheme.indexOf('/');
            if (slashIndex <= 0 || slashIndex == withoutScheme.length() - 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid MinIO storage path");
            }
            return new StorageLocation(
                    withoutScheme.substring(0, slashIndex),
                    withoutScheme.substring(slashIndex + 1));
        }

        String defaultBucketPrefix = defaultBucket + "/";
        if (normalizedPath.startsWith(defaultBucketPrefix)) {
            return new StorageLocation(defaultBucket, normalizedPath.substring(defaultBucketPrefix.length()));
        }

        return new StorageLocation(defaultBucket, normalizedPath);
    }

    private record StorageLocation(String bucket, String objectKey) {
    }
}