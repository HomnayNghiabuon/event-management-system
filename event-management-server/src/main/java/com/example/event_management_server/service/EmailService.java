package com.example.event_management_server.service;

import com.example.event_management_server.model.EmailLog;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.EmailLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final EmailLogRepository emailLogRepository;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public EmailService(EmailLogRepository emailLogRepository) {
        this.emailLogRepository = emailLogRepository;
    }

    // ── Organizer blast ───────────────────────────────────────────

    /**
     * Gửi email thông báo hàng loạt từ Organizer đến tất cả Attendee của sự kiện.
     * Nếu SMTP chưa cấu hình: bỏ qua việc gửi mail, chỉ lưu log vào DB.
     * Lỗi gửi cho từng recipient được bắt riêng lẻ — không dừng toàn bộ batch.
     */
    @Transactional
    public int sendToAttendees(Event event, List<User> recipients, String subject, String body) {
        // mailSender là null nếu spring.mail.host không được cấu hình (required=false)
        boolean mailConfigured = mailSender != null && mailFrom != null && !mailFrom.isBlank();
        log.info("sendToAttendees: mailConfigured={}, recipients={}", mailConfigured, recipients.size());

        int count = 0;
        for (User recipient : recipients) {
            try {
                if (mailConfigured) {
                    sendHtml(recipient.getEmail(), subject, buildBlastHtml(recipient, event, subject, body));
                }
                saveLog(recipient, event, subject, body);
                count++;
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", recipient.getEmail(), e.getMessage(), e);
            }
        }

        if (!mailConfigured) {
            log.info("Mail not configured — {} notifications logged to DB only", count);
        }
        return count;
    }

    // ── Ticket purchase confirmation ──────────────────────────────

    /**
     * Gửi email xác nhận đặt vé cho user sau khi thanh toán thành công.
     * @Async: chạy trong thread pool riêng, không block HTTP response trả về cho client.
     * Lỗi gửi mail được log nhưng không làm thất bại transaction mua vé.
     */
    @Async
    public void sendOrderConfirmation(User user, String eventTitle, int quantity, long orderId, List<String> qrCodes) {
        boolean mailConfigured = mailSender != null && mailFrom != null && !mailFrom.isBlank();
        if (!mailConfigured) {
            log.info("Mail not configured — order confirmation not sent to {}", user.getEmail());
            return;
        }
        try {
            String subject = "[BuyTicket] Xác nhận đặt vé – " + eventTitle;
            String html = buildOrderConfirmationHtml(user, eventTitle, quantity, orderId, qrCodes);
            sendHtml(user.getEmail(), subject, html);
            log.info("Order confirmation sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send order confirmation to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    // ── Internal helpers ──────────────────────────────────────────

    private void sendHtml(String to, String subject, String html) throws Exception {
        var message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom("BuyTicket <" + mailFrom + ">");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private void saveLog(User recipient, Event event, String subject, String body) {
        EmailLog entry = new EmailLog();
        entry.setRecipient(recipient);
        entry.setEvent(event);
        entry.setSubject(subject);
        entry.setContent(body);
        emailLogRepository.save(entry);
    }

    private String buildBlastHtml(User recipient, Event event, String subject, String body) {
        String eventTitle = event.getTitle() != null ? event.getTitle() : "";
        String name = recipient.getFullName() != null ? recipient.getFullName() : recipient.getEmail();
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#F5F7FA;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr><td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:28px 32px;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;">🎫 BuyTicket</h1>
                    </td></tr>
                    <!-- Body -->
                    <tr><td style="padding:32px;">
                      <p style="margin:0 0 8px;color:#374151;font-size:15px;">Xin chào <strong>%s</strong>,</p>
                      <p style="margin:0 0 20px;color:#6B7280;font-size:14px;">Bạn có thông báo mới từ sự kiện <strong>%s</strong>:</p>
                      <div style="background:#F9FAFB;border-left:4px solid #7C3AED;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
                        <h2 style="margin:0 0 8px;color:#1F2937;font-size:16px;">%s</h2>
                        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">%s</p>
                      </div>
                    </td></tr>
                    <!-- Footer -->
                    <tr><td style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;">
                      <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
                        Email này được gửi từ hệ thống BuyTicket. Vui lòng không trả lời email này.
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
            """.formatted(name, eventTitle, subject, body);
    }

    private String buildOrderConfirmationHtml(User user, String eventTitle, int quantity, long orderId, List<String> qrCodes) {
        String name = user.getFullName() != null ? user.getFullName() : user.getEmail();
        StringBuilder qrRows = new StringBuilder();
        for (int i = 0; i < qrCodes.size(); i++) {
            qrRows.append("""
                <tr>
                  <td style="padding:8px 12px;color:#374151;font-size:13px;">Vé #%d</td>
                  <td style="padding:8px 12px;color:#6B7280;font-size:12px;font-family:monospace;">%s</td>
                </tr>
                """.formatted(i + 1, qrCodes.get(i)));
        }
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#F5F7FA;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <tr><td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:28px 32px;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;">🎫 BuyTicket</h1>
                    </td></tr>
                    <tr><td style="padding:32px;">
                      <div style="text-align:center;margin-bottom:24px;">
                        <span style="font-size:48px;">✅</span>
                        <h2 style="margin:8px 0 4px;color:#059669;font-size:20px;">Đặt vé thành công!</h2>
                        <p style="margin:0;color:#6B7280;font-size:14px;">Đơn hàng #%d</p>
                      </div>
                      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Xin chào <strong>%s</strong>,</p>
                      <p style="margin:0 0 20px;color:#374151;font-size:14px;">
                        Bạn đã đặt thành công <strong>%d vé</strong> cho sự kiện <strong>%s</strong>.
                      </p>
                      <table width="100%%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                        <tr style="background:#F9FAFB;">
                          <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6B7280;font-weight:600;">Vé</th>
                          <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6B7280;font-weight:600;">Mã QR</th>
                        </tr>
                        %s
                      </table>
                      <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.5;">
                        Xuất trình mã QR này tại cửa vào để check-in. Bạn cũng có thể xem vé trong mục <strong>Vé của tôi</strong> trên website.
                      </p>
                    </td></tr>
                    <tr><td style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;">
                      <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
                        Email xác nhận tự động từ BuyTicket. Vui lòng không trả lời email này.
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
            """.formatted(orderId, name, quantity, eventTitle, qrRows.toString());
    }
}
