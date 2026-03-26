package com.smartedms.service;

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
    
    @Value("${audit-service.url}")
    private String auditServiceUrl;
    
    @Value("${audit.secret-key}")
    private String auditSecretKey;

    public AuditLogPublisherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Async
    public void publishLog(AuditLogRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", auditSecretKey);

            HttpEntity<AuditLogRequest> entity = new HttpEntity<>(request, headers);

            String url = auditServiceUrl + "/api/audit/logs";
            restTemplate.postForEntity(url, entity, String.class);
            
            // Xóa console log sau khi test thành công để log sạch hơn, nhưng giữ lại catch để Fault Tolerance
        } catch (Exception e) {
            // Lỗi gửi Log (vd Connection Refused do Node.js sập), bắt buộc Bắt (catch) 
            // KHÔNG throw exception ra ngoài để không làm hỏng transaction chính của hệ thống.
            // Fire-and-Forget.
            System.err.println("Lỗi gửi Audit Log tới Node.js: " + e.getMessage());
        }
    }
}
