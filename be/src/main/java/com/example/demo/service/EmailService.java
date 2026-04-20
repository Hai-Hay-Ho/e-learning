package com.example.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendNotification(List<String> toEmails, String subject, String teacherName, String actionLabel, String title, String directLink) {
        if (toEmails == null || toEmails.isEmpty()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setSubject(subject);

            // Giao diện email chuyên nghiệp
            String htmlContent = String.format(
                "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;\">" +
                "  <div style=\"text-align: center; padding: 20px;\"><h1 style=\"color: #4f46e5;\">Thông báo mới</h1></div>" +
                "  <div style=\"padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;\">" +
                "    <p>Chào bạn,</p>" +
                "    <p>Giảng viên <strong>%s</strong> %s trong lớp học của bạn:</p>" +
                "    <div style=\"background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;\">" +
                "      <p style=\"margin: 0; font-weight: bold;\">%s</p>" +
                "    </div>" +
                "    <div style=\"text-align: center; margin-top: 30px;\">" +
                "      <a href=\"%s\" style=\"background: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;\">Xem ngay</a>" +
                "    </div>" +
                "  </div>" +
                "</div>",
                teacherName, actionLabel, title, directLink
            );

            helper.setText(htmlContent, true);

            // Gửi cho từng student (BCC hoặc vòng lặp tùy nhu cầu, ở đây dùng vòng lặp cho đơn giản và bảo mật danh tính)
            for (String email : toEmails) {
                helper.setTo(email);
                mailSender.send(message);
            }

        } catch (MessagingException e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
