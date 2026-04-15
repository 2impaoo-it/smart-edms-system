package com.smartedms.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Script chạy tự động khi khởi động Spring Boot
 * Giúp xóa bỏ các constraint giới hạn Enum trên Database bị lỗi thời
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Đang kiểm tra và gỡ bỏ Constraint lỗi thời trên bảng 'documents'...");
            jdbcTemplate.execute("ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check");
            log.info("Đã xóa constraint 'documents_status_check' thành công! Các trạng thái mới (REVIEW, APPROVE) đã được cho phép.");
        } catch (Exception e) {
            log.warn("Bỏ qua lỗi gỡ constraint (có thể constraint không tồn tại): {}", e.getMessage());
        }
    }
}
