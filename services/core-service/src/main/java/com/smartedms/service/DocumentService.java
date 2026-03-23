package com.smartedms.service;

import com.smartedms.entity.Document;
import com.smartedms.repository.DocumentRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.InputStream;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MinioClient minioClient;
    private final String defaultBucket;

    public DocumentService(
            DocumentRepository documentRepository,
            MinioClient minioClient,
            @Value("${minio.bucket}") String defaultBucket) {
        this.documentRepository = documentRepository;
        this.minioClient = minioClient;
        this.defaultBucket = defaultBucket;
    }

    public ResponseEntity<InputStreamResource> streamPdf(Long id) {
        Document document = documentRepository.findById(id)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

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