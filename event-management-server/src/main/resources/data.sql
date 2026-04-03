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

-- ── USERS ───────────────────────────────────────────────────
-- Password mặc định cho tất cả tài khoản test: "123456"
-- Hash BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (id, full_name, email, password, role, phone, organization_name, created_at) VALUES
(RANDOM_UUID(), 'Admin System',         'admin@eventms.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',     NULL,         NULL,                  NOW()),
(RANDOM_UUID(), 'Nguyen Van Organizer', 'organizer@eventms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ORGANIZER', '0901234567', 'Cong ty Su Kien ABC', NOW()),
(RANDOM_UUID(), 'Tran Thi Attendee',    'attendee@eventms.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ATTENDEE',  NULL,         NULL,                  NOW());
