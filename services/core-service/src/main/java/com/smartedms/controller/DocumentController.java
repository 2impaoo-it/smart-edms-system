package com.smartedms.controller;

import com.smartedms.entity.Document;
import com.smartedms.entity.User;
import com.smartedms.repository.UserRepository;
import com.smartedms.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "APIs upload và xem trước tài liệu PDF trên MinIO")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    public DocumentController(DocumentService documentService, UserRepository userRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload PDF lên MinIO", description = "Nhận multipart/form-data, upload file PDF lên MinIO và lưu metadata vào bảng documents.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Upload thành công", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = Document.class))),
            @ApiResponse(responseCode = "400", description = "Thiếu file hoặc dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc token không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền upload vào thư mục này"),
            @ApiResponse(responseCode = "404", description = "Folder không tồn tại"),
            @ApiResponse(responseCode = "415", description = "Chỉ hỗ trợ file PDF")
    })
    public Document upload(
            @Parameter(description = "File PDF cần upload", required = true, content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))) @RequestParam("file") MultipartFile file,
            @Parameter(description = "ID folder cha. Bỏ trống nếu upload vào root", example = "1") @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return documentService.uploadPdf(file, folderId, userId);
    }

    @GetMapping("/{id}/view")
    @Operation(summary = "Lấy luồng PDF để xem trước", description = "Đọc file PDF từ MinIO theo document id và trả về dữ liệu stream.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Trả về stream PDF", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc token không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền xem tài liệu này"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy document hoặc file trong MinIO"),
            @ApiResponse(responseCode = "415", description = "Document không phải PDF")
    })
    public ResponseEntity<InputStreamResource> view(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return documentService.streamPdf(id, userId);
    }

    private Long resolveUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));
        return user.getId();
    }
}