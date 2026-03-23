package com.smartedms.controller;

import com.smartedms.dto.CategoryRequestDTO;
import com.smartedms.dto.TreeDTO;
import com.smartedms.entity.Category;
import com.smartedms.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "API quản lý thư mục/danh mục")
@SecurityRequirement(name = "bearerAuth")
public class ManagementController {

    private final CategoryService categoryService;

    public ManagementController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Lấy cây thư mục", description = "Trả về cây phân cấp tất cả thư mục")
    @GetMapping("/tree")
    public List<TreeDTO> getTree() {
        return categoryService.getTree();
    }

    @Operation(summary = "Tạo thư mục mới", description = "Tạo một thư mục/danh mục mới")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@RequestBody CategoryRequestDTO dto) {
        return categoryService.create(dto);
    }

    @Operation(summary = "Đổi tên thư mục", description = "Đổi tên của thư mục theo ID")
    @PutMapping("/{id}")
    public Category rename(@PathVariable Long id, @RequestBody CategoryRequestDTO dto) {
        return categoryService.rename(id, dto);
    }

    @Operation(summary = "Xóa thư mục", description = "Xóa mềm thư mục và tất cả nội dung bên trong")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.softDelete(id);
    }
}