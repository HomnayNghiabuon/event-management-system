# Event Management System - Database Schema


## User

| Field | Type | Key |
| --- | --- | --- |
| user_id | INT | PK |
| name | VARCHAR(100) |  |
| email | VARCHAR(150) | UNIQUE |
| password | VARCHAR(255) |  |
| phone | VARCHAR(20) |  |
| role | VARCHAR(20) |  |
| created_at | DATETIME |  |


## Categories

| Field | Type | Key |
| --- | --- | --- |
| category_id | INT | PK |
| name | VARCHAR(100) |  |
| description | TEXT |  |


## Events

| Field | Type | Key |
| --- | --- | --- |
| event_id | INT | PK |
| title | VARCHAR(200) |  |
| description | TEXT |  |
| location | VARCHAR(200) |  |
| event_date | DATE |  |
| start_time | TIME |  |
| end_time | TIME |  |
| status | VARCHAR(20) |  |
| organizer_id | INT | FK |
| category_id | INT | FK |


## TicketTypes

| Field | Type | Key |
| --- | --- | --- |
| ticket_type_id | INT | PK |
| event_id | INT | FK |
| name | VARCHAR(100) |  |
| price | DECIMAL(10,2) |  |
| quantity | INT |  |


## Orders

| Field | Type | Key |
| --- | --- | --- |
| order_id | INT | PK |
| user_id | INT | FK |
| event_id | INT | FK |
| total_price | DECIMAL(10,2) |  |
| payment_status | VARCHAR(20) |  |
| created_at | DATETIME |  |


## OrderItems

| Field | Type | Key |
| --- | --- | --- |
| order_item_id | INT | PK |
| order_id | INT | FK |
| ticket_type_id | INT | FK |
| quantity | INT |  |
| price | DECIMAL(10,2) |  |


## Tickets

| Field | Type | Key |
| --- | --- | --- |
| ticket_id | INT | PK |
| order_item_id | INT | FK |
| qr_code | VARCHAR(255) |  |
| checkin_status | BOOLEAN |  |
| checkin_time | DATETIME |  |


## Notifications

| Field | Type | Key |
| --- | --- | --- |
| notification_id | INT | PK |
| user_id | INT | FK |
| title | VARCHAR(200) |  |
| message | TEXT |  |
| created_by | INT | FK |
| created_at | DATETIME |  |


## EmailLogs

| Field | Type | Key |
| --- | --- | --- |
| email_id | INT | PK |
| event_id | INT | FK |
| recipient_email | VARCHAR(150) |  |
| subject | VARCHAR(200) |  |
| content | TEXT |  |
| sent_by | INT | FK |
| sent_at | DATETIME |  |


## Commission

| Field | Type | Key |
| --- | --- | --- |
| commission_id | INT | PK |
| percent | DECIMAL(5,2) |  |
| created_at | DATETIME |  |
