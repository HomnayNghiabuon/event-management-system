-- ============================================================
-- Seed Data – Event Management System (H2 compatible)
-- Chạy tự động khi khởi động (ddl-auto: create-drop → bảng luôn mới)
-- ============================================================

-- ── CATEGORIES ──────────────────────────────────────────────
INSERT INTO categories (category_id, name, description, created_at) VALUES
(1, 'Âm nhạc',    'Các sự kiện hòa nhạc, concert, live music',         NOW()),
(2, 'Công nghệ',  'Hội thảo, hackathon, tech talk về công nghệ',        NOW()),
(3, 'Thể thao',   'Giải đấu, marathon, các môn thể thao',               NOW()),
(4, 'Giáo dục',   'Hội thảo học thuật, workshop, seminar',              NOW()),
(5, 'Nghệ thuật', 'Triển lãm tranh, nhiếp ảnh, biểu diễn nghệ thuật',  NOW());

-- ── COMMISSIONS ─────────────────────────────────────────────
INSERT INTO commissions (commission_id, percent, effective_from, is_active, created_at) VALUES
(1, 5.00, NOW(), true, NOW());

-- ── USERS được tạo bởi DataInitializer (password hash đúng) ──
-- admin@eventms.com  / 123456 → ADMIN
-- organizer@eventms.com / 123456 → ORGANIZER
-- attendee@eventms.com  / 123456 → ATTENDEE
