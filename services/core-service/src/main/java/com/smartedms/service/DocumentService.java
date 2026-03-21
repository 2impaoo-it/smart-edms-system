package com.smartedms.service;

import com.smartedms.entity.Category;
import com.smartedms.entity.Document;
import com.smartedms.entity.PermissionLevel;
import com.smartedms.repository.CategoryRepository;
import com.smartedms.repository.DocumentRepository;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.MinioException;
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

import java.io.InputStream;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Service
public class DocumentService {

    private final CategoryRepository categoryRepository;
    private final DocumentRepository documentRepository;
    private final MinioClient minioClient;
    private final String defaultBucket;
    private final FolderPermissionService permissionService;

    public DocumentService(
            CategoryRepository categoryRepository,
            DocumentRepository documentRepository,
            MinioClient minioClient,
            @Value("${minio.bucket}") String defaultBucket,
            FolderPermissionService permissionService) {
        this.categoryRepository = categoryRepository;
        this.documentRepository = documentRepository;
        this.minioClient = minioClient;
        this.defaultBucket = defaultBucket;
        this.permissionService = permissionService;
    }

    public Document uploadPdf(MultipartFile file, Long folderId, Long userId) {
        validatePdf(file);
        validateFolder(folderId);

        // Kiểm tra quyền EDITOR trên thư mục đích
        if (folderId != null && !permissionService.hasMinimumPermission(userId, folderId, PermissionLevel.EDITOR)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền upload vào thư mục này");
        }

        String originalFileName = file.getOriginalFilename();
        String storedFileName = buildStoredFileName(originalFileName);
        String objectKey = buildObjectKey(folderId, storedFileName);

        try (InputStream inputStream = file.getInputStream()) {
            ensureBucketExists(defaultBucket);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(defaultBucket)
                            .object(objectKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(MediaType.APPLICATION_PDF_VALUE)
                            .build());

            Document document = new Document();
            document.setName(originalFileName);
            document.setFolderId(folderId);
            document.setFilePath(defaultBucket + "/" + objectKey);
            document.setDeleted(false);
            return documentRepository.save(document);
        } catch (MinioException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload PDF to MinIO", exception);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload document", exception);
        }
    }

    public ResponseEntity<InputStreamResource> streamPdf(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        // Kiểm tra quyền VIEWER trên thư mục chứa document
        if (document.getFolderId() != null && !permissionService.hasMinimumPermission(userId, document.getFolderId(), PermissionLevel.VIEWER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem tài liệu này");
        }

        StorageLocation location = resolveLocation(document.getFilePath());

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
            headers.setContentDisposition(ContentDisposition.inline().filename(document.getName()).build());
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

    private void ensureBucketExists(String bucketName) throws Exception {
        boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build());
        if (!bucketExists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name is missing");
        }

        String normalizedFileName = originalFileName.toLowerCase(Locale.ROOT);
        String contentType = file.getContentType();
        boolean hasPdfExtension = normalizedFileName.endsWith(".pdf");
        boolean isPdfContentType = MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType);

        if (!hasPdfExtension && !isPdfContentType) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Only PDF files are supported");
        }
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