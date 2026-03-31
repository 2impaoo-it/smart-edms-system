package com.smartedms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationPublisherService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${audit-service.url}")
    private String auditServiceUrl;

    @Value("${audit.secret-key}")
    private String auditSecretKey;

    public NotificationPublisherService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Gửi thông báo realtime tới một user cụ thể.
     */
    @Async
    public void sendNotification(Long userId, String title, String message, String type) {
        sendNotification(userId != null ? userId.toString() : null, title, message, type, null);
    }

    /**
     * Gửi thông báo realtime (có thể gửi cho tất cả nếu userId là null).
     */
    @Async
    public void sendNotification(String userId, String title, String message, String type, Map<String, Object> data) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", type != null ? type : "info");
            payload.put("data", data != null ? data : new HashMap<>());

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", auditSecretKey);

            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            restTemplate.postForEntity(auditServiceUrl + "/api/audit/notifications", entity, String.class);
        } catch (Exception e) {
            System.err.println("Lỗi gửi Realtime Notification: " + e.getMessage());
        }
    }
}
