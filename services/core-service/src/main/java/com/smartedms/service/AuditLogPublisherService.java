package com.smartedms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartedms.dto.AuditLogRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AuditLogPublisherService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${audit-service.url}")
    private String auditServiceUrl;

    @Value("${audit.secret-key}")
    private String auditSecretKey;

    public AuditLogPublisherService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Gửi audit log trực tiếp đến Audit Service qua REST API.
     */
    @Async
    public void publishLog(AuditLogRequest request) {
        try {
            String jsonLogMessage = objectMapper.writeValueAsString(request);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", auditSecretKey);

            HttpEntity<String> entity = new HttpEntity<>(jsonLogMessage, headers);
            restTemplate.postForEntity(auditServiceUrl + "/api/audit/logs", entity, String.class);
        } catch (Exception e) {
            // Fault Tolerance: Fire-and-Forget – không để lỗi audit ảnh hưởng nghiệp vụ chính
            System.err.println("Lỗi gửi Audit Log tới Audit Service: " + e.getMessage());
        }
    }
}
