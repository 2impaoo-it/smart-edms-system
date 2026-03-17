package com.smartedms.controller;

import com.smartedms.entity.Document;
import com.smartedms.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "APIs upload va xem truoc tai lieu PDF tren MinIO")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách các file trong folder", security = @SecurityRequirement(name = "bearerAuth"))
    public List<Document> getByFolderId(@RequestParam(required = false) Long folderId) {
        return documentService.getByFolderId(folderId);
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload PDF len MinIO", description = "Nhan multipart/form-data, upload file PDF len MinIO va luu metadata vao bang documents.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Upload thanh cong", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = Document.class))),
            @ApiResponse(responseCode = "400", description = "Thieu file hoac du lieu khong hop le"),
            @ApiResponse(responseCode = "401", description = "Chua dang nhap hoac token khong hop le"),
            @ApiResponse(responseCode = "404", description = "Folder khong ton tai"),
            @ApiResponse(responseCode = "415", description = "Chi ho tro file PDF")
    })
    public Document upload(
            @Parameter(description = "File PDF can upload", required = true, content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))) @RequestParam("file") MultipartFile file,
            @Parameter(description = "ID folder cha. Bo trong neu upload vao root", example = "1") @RequestParam(value = "folderId", required = false) Long folderId) {
        return documentService.uploadPdf(file, folderId);
    }

    @GetMapping("/{id}/view")
    @Operation(summary = "Lay luong PDF de xem truoc", description = "Doc file PDF tu MinIO theo document id va tra ve du lieu stream de frontend nhung viewer.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tra ve stream PDF", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "401", description = "Chua dang nhap hoac token khong hop le"),
            @ApiResponse(responseCode = "404", description = "Khong tim thay document hoac file trong MinIO"),
            @ApiResponse(responseCode = "415", description = "Document khong phai PDF")
    })
    public ResponseEntity<InputStreamResource> view(@PathVariable Long id) {
        return documentService.streamPdf(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tài liệu", description = "Xóa mềm (soft delete) tài liệu theo id", security = @SecurityRequirement(name = "bearerAuth"))
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentService.softDelete(id);
    }
}