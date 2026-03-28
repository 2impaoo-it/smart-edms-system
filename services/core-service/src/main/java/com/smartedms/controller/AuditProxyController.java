package com.smartedms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit Logs", description = "Proxy cho Node.js Audit Log")
@SecurityRequirement(name = "bearerAuth")
public class AuditProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/logs")
    @Operation(summary = "Lấy log hệ thống", description = "Gửi request proxy qua Node.js service ở cổng 3001")
    public ResponseEntity<String> getAuditLogs(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String action) {

        String url = "http://localhost:3001/api/audit/logs";
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url);
        
        if (limit != null) builder.queryParam("limit", limit);
        if (action != null) builder.queryParam("action", action);

        return restTemplate.getForEntity(builder.toUriString(), String.class);
    }
}
