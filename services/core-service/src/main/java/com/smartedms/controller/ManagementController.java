package com.smartedms.controller;

import com.smartedms.dto.CategoryRequestDTO;
import com.smartedms.dto.TreeDTO;
import com.smartedms.entity.Category;
import com.smartedms.entity.User;
import com.smartedms.repository.UserRepository;
import com.smartedms.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "API quản lý thư mục/danh mục")
@SecurityRequirement(name = "bearerAuth")
public class ManagementController {

    private final CategoryService categoryService;
    private final UserRepository userRepository;

    public ManagementController(CategoryService categoryService, UserRepository userRepository) {
        this.categoryService = categoryService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Lấy cây thư mục", description = "Trả về cây thư mục mà user hiện tại có quyền truy cập")
    @GetMapping("/tree")
    public List<TreeDTO> getTree(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return categoryService.getTree(userId);
    }

    @GetMapping
    public List<Category> getByParentId(@RequestParam(required = false) Long parentId) {
        return categoryService.getByParentId(parentId);
    }

    @Operation(summary = "Tạo thư mục mới", description = "Tạo thư mục mới, gán người tạo là user hiện tại")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@RequestBody CategoryRequestDTO dto,
                           @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return categoryService.create(dto, userId);
    }

    @Operation(summary = "Đổi tên thư mục", description = "Đổi tên thư mục (cần quyền EDITOR)")
    @PutMapping("/{id}")
    public Category rename(@PathVariable Long id,
                           @RequestBody CategoryRequestDTO dto,
                           @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return categoryService.rename(id, dto, userId);
    }

    @Operation(summary = "Xóa thư mục", description = "Xóa mềm thư mục (chỉ owner mới được xóa)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        categoryService.softDelete(id, userId);
    }

    private Long resolveUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));
        return user.getId();
    }
}