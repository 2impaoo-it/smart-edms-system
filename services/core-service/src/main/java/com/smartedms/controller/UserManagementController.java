package com.smartedms.controller;

import com.smartedms.dto.CreateUserRequest;
import com.smartedms.entity.User;
import com.smartedms.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "API quản trị tài khoản")
@SecurityRequirement(name = "bearerAuth")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Admin tạo tài khoản", description = "Admin nhập thông tin, chọn role. Hệ thống tự gán mật khẩu mặc định và bắt buộc đổi mật khẩu ở lần đăng nhập đầu")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo tài khoản thành công", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền admin"),
            @ApiResponse(responseCode = "409", description = "Username hoặc email đã tồn tại")
    })
    public User createUser(
            @RequestBody(description = "Thông tin tài khoản cần tạo", required = true, content = @Content(schema = @Schema(implementation = CreateUserRequest.class))) @org.springframework.web.bind.annotation.RequestBody CreateUserRequest request) {
        return userManagementService.createByAdmin(request);
    }
}
