package com.example.event_management_server.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@Service
public class QrCodeService {

    private static final int SIZE = 300; // QR image 300×300 pixel

    /**
     * Tạo QR code PNG từ chuỗi content (UUID của ticket).
     * ErrorCorrectionLevel.M: phục hồi được khi 15% dữ liệu bị hỏng — cân bằng giữa kích thước và độ bền.
     * MARGIN=2: viền trắng tối thiểu quanh QR, đủ cho scanner nhận dạng.
     */
    public byte[] generatePng(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = Map.of(
                    EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M, // chịu được 15% hỏng
                    EncodeHintType.MARGIN, 2 // quiet zone tối thiểu
            );
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, SIZE, SIZE, hints);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out); // render BitMatrix → PNG binary
            return out.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Không thể tạo QR code", e);
        }
    }
}
