erDiagram
    %% QUAN HỆ GIỮA CÁC BẢNG (RELATIONSHIPS)
    users ||--o{ events : "Tổ chức (organizer_id)"
    categories ||--o{ events : "Phân loại (category_id)"
    events ||--o{ ticket_types : "Có các hạng vé (event_id)"
    
    users ||--o{ orders : "Đặt hàng (user_id)"
    orders ||--o{ order_details : "Bao gồm (order_id)"
    ticket_types ||--o{ order_details : "Chi tiết vé mua (ticket_type_id)"
    
    order_details ||--o{ tickets : "Sinh ra vé (order_detail_id)"
    users ||--o{ tickets : "Sở hữu vé (attendee_id)"
    
    users ||--o{ ticket_reservations : "Giữ chỗ (user_id)"
    ticket_types ||--o{ ticket_reservations : "Vé được giữ (ticket_type_id)"
    
    users ||--o{ notifications : "Nhận thông báo (user_id)"
    
    users ||--o{ email_logs : "Người nhận (recipient_id)"
    events ||--o{ email_logs : "Thuộc sự kiện (event_id)"

    %% CHI TIẾT CÁC BẢNG (ENTITIES & ATTRIBUTES)
    users {
        INT user_id PK
        VARCHAR name
        VARCHAR email "UNIQUE"
        VARCHAR password
        VARCHAR phone
        ENUM role "ADMIN, ORGANIZER, ATTENDEE"
        DATETIME created_at
        DATE dob
        BOOLEAN is_active
        VARCHAR gender
    }

    categories {
        INT category_id PK
        VARCHAR name
        TEXT description
    }

    events {
        INT event_id PK
        VARCHAR title
        TEXT description
        DATE event_date
        TIME start_time
        TIME end_time
        VARCHAR status
        VARCHAR location
        VARCHAR thumbnail
        DECIMAL min_price
        INT organizer_id FK
        INT category_id FK
    }

    ticket_types {
        INT ticket_type_id PK
        INT event_id FK
        VARCHAR name
        DECIMAL price
        INT quantity
    }

    orders {
        INT order_id PK
        INT user_id FK
        DECIMAL total_price
        VARCHAR payment_status
        DATETIME created_at
        VARCHAR payment_method
        VARCHAR transaction_id
    }

    order_details {
        INT order_detail_id PK
        INT order_id FK
        INT ticket_type_id FK
        INT quantity
        DECIMAL price
    }

    tickets {
        INT ticket_id PK
        INT order_detail_id FK
        INT attendee_id FK
        VARCHAR qr_code
        BOOLEAN checkin_status
        DATETIME checkin_time
        VARCHAR attendee_name
    }

    notifications {
        INT notification_id PK
        INT user_id FK
        VARCHAR title
        TEXT message
        DATETIME created_at
        BOOLEAN is_read
        VARCHAR type
    }

    email_logs {
        INT email_id PK
        INT recipient_id FK
        INT event_id FK
        VARCHAR subject
        TEXT content
        DATETIME send_at
    }

    commissions {
        INT commission_id PK
        DECIMAL percent
        DATETIME created_at
        DATETIME effective_from
        BOOLEAN is_active
    }

    ticket_reservations {
        INT reservation_id PK
        INT user_id FK
        INT ticket_type_id FK
        INT quantity
        VARCHAR status
        DATETIME expires_at
        DATETIME created_at
    }