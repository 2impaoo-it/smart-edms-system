package com.smartedms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Email Service: Gửi email cho users
 * Được dùng bởi: OTP, Document reminders, ...
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@smartedms.vn}")
    private String fromEmail;

    @Value("${app.name:HUTECH Smart EDMS}")
    private String appName;

    /**
     * Gửi email văn bản thường
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("[" + appName + "] " + subject);
            message.setText(body);
            mailSender.send(message);
            log.info("✅ Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }

    /**
     * Gửi email HTML
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("[" + appName + "] " + subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(message);
            log.info("✅ HTML email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }

    /**
     * Gửi email nhắc hẹn cho approver (Feature 5)
     */
    public void sendDocumentReminderEmail(String to, String documentName, String approverName) {
        String subject = "📋 Nhắc hẹn: Document cần ký " + documentName;
        String htmlBody = String.format(
                "<html><body style=\"font-family: Arial, sans-serif;\">" +
                        "<h2>🔔 Nhắc hẹn Ký Document</h2>" +
                        "<p>Xin chào <strong>%s</strong>,</p>" +
                        "<p>Document <strong>%s</strong> sắp hết hạn ký (sắp quá hạn 1 ngày).</p>" +
                        "<p>Vui lòng đăng nhập hệ thống để xử lý:</p>" +
                        "<p><a href=\"{APP_URL}/approvals\">👉 Xem document chờ ký</a></p>" +
                        "<br/>" +
                        "<p style=\"color: #999;\">Đây là email tự động từ hệ thống. Vui lòng không trả lời.</p>" +
                        "</body></html>",
                approverName, documentName);
        sendHtmlEmail(to, subject, htmlBody);
    }

    /**
     * Gửi email xác nhận khi ký thành công
     */
    public void sendSignatureConfirmationEmail(String to, String documentName, String userName) {
        String subject = "✅ Xác nhận: Bạn đã ký document " + documentName;
        String htmlBody = String.format(
                "<html><body style=\"font-family: Arial, sans-serif;\">" +
                        "<h2>✅ Xác Nhận Ký Document</h2>" +
                        "<p>Xin chào <strong>%s</strong>,</p>" +
                        "<p>Bạn đã ký thành công document <strong>%s</strong>.</p>" +
                        "<p><strong>Chi tiết:</strong></p>" +
                        "<ul>" +
                        "<li>Tên document: %s</li>" +
                        "<li>Thời gian ký: {TIMESTAMP}</li>" +
                        "<li>Trạng thái: Đã ký</li>" +
                        "</ul>" +
                        "<br/>" +
                        "<p style=\"color: #999;\">Đây là email tự động từ hệ thống. Vui lòng không trả lời.</p>" +
                        "</body></html>",
                userName, documentName, documentName);
        sendHtmlEmail(to, subject, htmlBody);
    }
}
