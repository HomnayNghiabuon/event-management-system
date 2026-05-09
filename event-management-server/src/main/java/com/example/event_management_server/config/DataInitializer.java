package com.example.event_management_server.config;

import com.example.event_management_server.model.Category;
import com.example.event_management_server.model.Commission;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.OrderCommission;
import com.example.event_management_server.model.OrderDetail;
import com.example.event_management_server.model.ReservationStatus;
import com.example.event_management_server.model.Role;
import com.example.event_management_server.model.Ticket;
import com.example.event_management_server.model.TicketReservation;
import com.example.event_management_server.model.TicketType;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Configuration
public class DataInitializer {

    // ══════════════════════════════════════════════════════════
    // ORDER 1 – Tạo tài khoản test
    // ══════════════════════════════════════════════════════════
    @Bean
    @Order(1)
    ApplicationRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // --- Tài khoản gốc ---
            seedUser(userRepository, passwordEncoder, "Admin System",         "admin@eventms.com",      Role.ADMIN,     null,         null);
            seedUser(userRepository, passwordEncoder, "Nguyen Van Organizer", "organizer@eventms.com",  Role.ORGANIZER, "0901234567", "Cong ty Su Kien ABC");
            seedUser(userRepository, passwordEncoder, "Tran Thi Attendee",    "attendee@eventms.com",   Role.ATTENDEE,  null,         null);

            // --- Organizer bổ sung ---
            seedUser(userRepository, passwordEncoder, "Le Thi Mai",           "organizer2@eventms.com", Role.ORGANIZER, "0912345678", "Cong ty Giai Tri XYZ");
            seedUser(userRepository, passwordEncoder, "Pham Van Duc",         "organizer3@eventms.com", Role.ORGANIZER, "0923456789", "Trung Tam Van Hoa Thanh Pho");

            // --- Attendee bổ sung ---
            seedUser(userRepository, passwordEncoder, "Nguyen Thi Lan",  "attendee2@eventms.com", Role.ATTENDEE, "0934567890", null);
            seedUser(userRepository, passwordEncoder, "Le Van Hung",     "attendee3@eventms.com", Role.ATTENDEE, "0945678901", null);
            seedUser(userRepository, passwordEncoder, "Tran Thi Hoa",    "attendee4@eventms.com", Role.ATTENDEE, "0956789012", null);
            seedUser(userRepository, passwordEncoder, "Vo Van Nam",      "attendee5@eventms.com", Role.ATTENDEE, "0967890123", null);
            seedUser(userRepository, passwordEncoder, "Dang Thi Thu",    "attendee6@eventms.com", Role.ATTENDEE, "0978901234", null);
        };
    }

    private void seedUser(UserRepository repo, PasswordEncoder enc,
                          String fullName, String email, Role role,
                          String phone, String organizationName) {
        if (repo.existsByEmail(email)) return;
        User u = new User();
        u.setFullName(fullName);
        u.setEmail(email);
        u.setPassword(enc.encode("123456"));
        u.setRole(role);
        u.setPhone(phone);
        u.setOrganizationName(organizationName);
        repo.save(u);
    }

    // ══════════════════════════════════════════════════════════
    // ORDER 2 – Seed events, ticket types, orders, tickets
    // ══════════════════════════════════════════════════════════
    @Bean
    @Order(2)
    ApplicationRunner seedEventData(
            UserRepository userRepo,
            CategoryRepository categoryRepo,
            EventRepository eventRepo,
            TicketTypeRepository ttRepo,
            TicketReservationRepository reservationRepo,
            OrderRepository orderRepo,
            OrderDetailRepository odRepo,
            TicketRepository ticketRepo,
            OrderCommissionRepository ocRepo,
            CommissionRepository sysCommRepo) {
        return args -> {
            if (eventRepo.count() > 0) return;

            // ── Lấy references ────────────────────────────────
            User admin = userRepo.findByEmail("admin@eventms.com").orElseThrow();
            User org1  = userRepo.findByEmail("organizer@eventms.com").orElseThrow();
            User org2  = userRepo.findByEmail("organizer2@eventms.com").orElseThrow();
            User org3  = userRepo.findByEmail("organizer3@eventms.com").orElseThrow();
            User att1  = userRepo.findByEmail("attendee@eventms.com").orElseThrow();
            User att2  = userRepo.findByEmail("attendee2@eventms.com").orElseThrow();
            User att3  = userRepo.findByEmail("attendee3@eventms.com").orElseThrow();
            User att4  = userRepo.findByEmail("attendee4@eventms.com").orElseThrow();
            User att5  = userRepo.findByEmail("attendee5@eventms.com").orElseThrow();
            User att6  = userRepo.findByEmail("attendee6@eventms.com").orElseThrow();

            Category music = categoryRepo.findById(1).orElseThrow();
            Category tech  = categoryRepo.findById(2).orElseThrow();
            Category sport = categoryRepo.findById(3).orElseThrow();
            Category edu   = categoryRepo.findById(4).orElseThrow();
            Category art   = categoryRepo.findById(5).orElseThrow();

            Commission sysCom = sysCommRepo.findFirstByIsActiveTrueOrderByEffectiveFromDesc().orElseThrow();

            // ══ EVENTS ════════════════════════════════════════

            // ── Âm nhạc ───────────────────────────────────────
            Event e1 = mkEvent(eventRepo,
                "Đêm nhạc Acoustic Sài Gòn",
                "Hòa mình vào không gian âm nhạc đầy cảm xúc với những ca khúc acoustic được trình diễn bởi các nghệ sĩ indie hàng đầu Việt Nam. Sự kiện diễn ra trong không gian ấm cúng tại nhà hát lịch sử giữa trung tâm thành phố, mang đến trải nghiệm âm nhạc độc đáo và khó quên.",
                LocalDate.of(2025, 3, 15), LocalTime.of(19, 0), LocalTime.of(22, 0),
                "PUBLISHED", "7 Công trường Lam Sơn, Bến Nghé, Quận 1, TP.HCM",
                10.7769, 106.7009, "Nhà hát Thành phố Hồ Chí Minh",
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                150000, "APPROVED", org1, music, admin, null);

            Event e2 = mkEvent(eventRepo,
                "Festival Âm nhạc Mùa Hè 2026",
                "Lễ hội âm nhạc mùa hè hoành tráng với hơn 50 nghệ sĩ từ khắp nơi trên thế giới. Ba ngày ba đêm với âm nhạc không ngừng nghỉ trên 3 sân khấu ngoài trời, kết hợp ẩm thực đường phố và nghệ thuật sắp đặt. Đây là sự kiện âm nhạc ngoài trời lớn nhất miền Nam.",
                LocalDate.of(2026, 7, 10), LocalTime.of(16, 0), LocalTime.of(23, 30),
                "PUBLISHED", "Nguyễn Lương Bằng, Phường Tân Phú, Quận 7, TP.HCM",
                10.7289, 106.7218, "Khu Đô thị Phú Mỹ Hưng, Quảng trường trung tâm",
                "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
                300000, "APPROVED", org1, music, admin, null);

            Event e3 = mkEvent(eventRepo,
                "Concert Rock Hà Nội Underground",
                "Đêm rock cuồng nhiệt với các ban nhạc underground nổi tiếng tại Hà Nội. Âm thanh sống động, ánh sáng hiệu ứng mãn nhãn.",
                LocalDate.of(2025, 6, 20), LocalTime.of(20, 0), LocalTime.of(23, 0),
                "DRAFT", "43 Trần Phú, Ba Đình, Hà Nội",
                21.0285, 105.8542, "Cung Thể thao Quần Ngựa",
                "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
                250000, "REJECTED", org1, music, admin,
                "Nội dung chưa phù hợp với quy định về biểu diễn nghệ thuật. Đề nghị bổ sung giấy phép biểu diễn và xác nhận của Ban quản lý địa điểm.");

            Event e4 = mkEvent(eventRepo,
                "Lễ hội Âm nhạc Đường phố Hà Nội",
                "Ba ngày lễ hội âm nhạc tại các tuyến phố đi bộ Hà Nội với hơn 30 ban nhạc và nghệ sĩ độc lập. Sự kiện hoàn toàn miễn phí cho khu vực ngoài trời, khu vực VIP có bán vé với nhiều ưu đãi đặc biệt. Lần đầu tiên tổ chức quy mô lớn tại phố đi bộ Hồ Hoàn Kiếm.",
                LocalDate.of(2025, 2, 20), LocalTime.of(15, 0), LocalTime.of(22, 0),
                "PUBLISHED", "Phố Đinh Tiên Hoàng, Phường Hàng Trống, Hoàn Kiếm, Hà Nội",
                21.0285, 105.8542, "Phố đi bộ Hồ Hoàn Kiếm",
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
                200000, "APPROVED", org2, music, admin, null);

            Event e5 = mkEvent(eventRepo,
                "Đêm nhạc Jazz & Blues Đà Nẵng",
                "Thưởng thức jazz và blues trong không gian sang trọng bên bờ biển Đà Nẵng. Sự kiện quy tụ các nhạc sĩ jazz hàng đầu trong và ngoài nước, kết hợp với rượu vang và ẩm thực fine dining. Không gian nhỏ, thân mật chỉ 200 khách mời.",
                LocalDate.of(2026, 8, 5), LocalTime.of(18, 0), LocalTime.of(22, 30),
                "PUBLISHED", "Bãi Bắc, Thọ Quang, Sơn Trà, Đà Nẵng",
                16.0019, 108.2187, "InterContinental Danang Sun Peninsula Resort",
                "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800",
                300000, "APPROVED", org3, music, admin, null);

            // ── Công nghệ ─────────────────────────────────────
            Event e6 = mkEvent(eventRepo,
                "Hội thảo AI & Machine Learning Việt Nam 2025",
                "Hội thảo chuyên sâu về trí tuệ nhân tạo và học máy, quy tụ các chuyên gia từ Google, Microsoft, VinAI. Nội dung: Large Language Models, Computer Vision, MLOps và ứng dụng AI trong doanh nghiệp Việt Nam. Buổi chiều có workshop thực hành với GPU cloud.",
                LocalDate.of(2025, 4, 10), LocalTime.of(8, 30), LocalTime.of(17, 30),
                "PUBLISHED", "8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP.HCM",
                10.7899, 106.6889, "GEM Center, Hội trường chính",
                "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800",
                200000, "APPROVED", org1, tech, admin, null);

            Event e7 = mkEvent(eventRepo,
                "Workshop React & TypeScript Nâng cao",
                "Workshop thực hành chuyên sâu React 18 và TypeScript cho frontend developers. Custom Hooks, React Query, Zustand, Performance Optimization và Testing với Vitest.",
                LocalDate.of(2026, 8, 20), LocalTime.of(9, 0), LocalTime.of(17, 0),
                "DRAFT", "2 Hải Triều, Bến Nghé, Quận 1, TP.HCM",
                10.7717, 106.7039, "Bitexco Financial Tower, Tầng 22 - Phòng hội thảo",
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
                400000, "PENDING", org1, tech, null, null);

            Event e8 = mkEvent(eventRepo,
                "Tech Summit Vietnam 2026",
                "Hội nghị công nghệ lớn nhất năm 2026 tại Việt Nam với hơn 5,000 người tham dự và 100+ diễn giả từ các tập đoàn công nghệ toàn cầu. Chủ đề: Future of Technology in Southeast Asia – AI, Cloud, Cybersecurity và Digital Transformation.",
                LocalDate.of(2026, 9, 15), LocalTime.of(8, 0), LocalTime.of(20, 0),
                "PUBLISHED", "57 Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội",
                21.0068, 105.8431, "Trung tâm Hội nghị Quốc gia, Hội trường A",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                500000, "APPROVED", org2, tech, admin, null);

            Event e9 = mkEvent(eventRepo,
                "Hackathon Sinh viên Việt Nam 2025",
                "Cuộc thi hackathon 48 giờ dành riêng cho sinh viên với chủ đề 'Công nghệ vì cộng đồng'. Giải nhất 50 triệu, giải nhì 20 triệu, giải ba 10 triệu và 5 giải khuyến khích. Đội 4 người, mentor 24/7 từ kỹ sư senior của các tập đoàn lớn.",
                LocalDate.of(2025, 5, 10), LocalTime.of(8, 0), LocalTime.of(23, 59),
                "PUBLISHED", "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM",
                10.7724, 106.6583, "Đại học Bách khoa TP.HCM, Khu B - Hội trường B4",
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
                200000, "APPROVED", org3, tech, admin, null);

            Event e10 = mkEvent(eventRepo,
                "Hội nghị Blockchain & Web3 Việt Nam",
                "Khám phá tương lai của Blockchain và Web3 trong nền kinh tế số Việt Nam. DeFi, NFT, Smart Contracts và ứng dụng thực tiễn trong tài chính, y tế và giáo dục.",
                LocalDate.of(2026, 10, 8), LocalTime.of(9, 0), LocalTime.of(18, 0),
                "DRAFT", "88 Đồng Khởi, Bến Nghé, Quận 1, TP.HCM",
                10.7740, 106.7034, "Sheraton Saigon Hotel & Towers, Phòng hội nghị Đồng Khởi",
                "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
                600000, "PENDING", org3, tech, null, null);

            // ── Thể thao ──────────────────────────────────────
            Event e11 = mkEvent(eventRepo,
                "VnExpress Marathon TP.HCM 2025",
                "Giải marathon thường niên lớn nhất TP.HCM với hơn 10,000 vận động viên. Ba cự ly: Full 42km, Half 21km và Fun Run 10km dọc các tuyến đường trung tâm thành phố. Áo finisher, huy chương và chip điện tử theo dõi thành tích.",
                LocalDate.of(2025, 4, 20), LocalTime.of(5, 0), LocalTime.of(12, 0),
                "PUBLISHED", "135 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3, TP.HCM",
                10.7778, 106.6953, "Dinh Thống Nhất (điểm xuất phát & đích đến)",
                "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
                200000, "APPROVED", org2, sport, admin, null);

            Event e12 = mkEvent(eventRepo,
                "Giải Bóng đá Sinh viên Mở rộng TP.HCM 2025",
                "Giải bóng đá phong trào dành cho sinh viên các trường đại học tại TP.HCM. 32 đội, thi đấu vòng tròn trong 2 ngày. Trận chung kết kết hợp giao lưu văn nghệ và trao giải.",
                LocalDate.of(2025, 3, 25), LocalTime.of(7, 0), LocalTime.of(18, 0),
                "PUBLISHED", "138 Đường 3 Tháng 2, Phường 11, Quận 10, TP.HCM",
                10.7815, 106.6877, "Sân vận động Thống Nhất",
                "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800",
                50000, "APPROVED", org2, sport, admin, null);

            Event e13 = mkEvent(eventRepo,
                "Yoga & Wellness Retreat Weekend",
                "Khóa retreat cuối tuần 2 ngày 1 đêm tại resort 4 sao. Yoga buổi sáng, thiền định, breathing exercises, workshop dinh dưỡng và massage thư giãn. Chỗ ở và toàn bộ bữa ăn healthy được bao gồm trong giá vé.",
                LocalDate.of(2026, 6, 5), LocalTime.of(7, 0), LocalTime.of(18, 0),
                "PUBLISHED", "Xã Bình Châu, Huyện Xuyên Mộc, Tỉnh Bà Rịa - Vũng Tàu",
                10.5213, 107.4712, "Khu du lịch sinh thái Bình Châu - Phước Bửu",
                "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800",
                1500000, "APPROVED", org2, sport, admin, null);

            Event e14 = mkEvent(eventRepo,
                "Chạy bộ từ thiện 5K – Vì trẻ em vùng cao",
                "Sự kiện chạy bộ kết hợp gây quỹ từ thiện cho trẻ em vùng cao. 100% tiền đăng ký chuyển vào quỹ học bổng. Ai cũng tham gia được, không giới hạn độ tuổi. Tặng áo đồng phục và huy chương.",
                LocalDate.of(2026, 6, 15), LocalTime.of(6, 30), LocalTime.of(10, 0),
                "PUBLISHED", "55 Trương Định, Phường Võ Thị Sáu, Quận 3, TP.HCM",
                10.7781, 106.6913, "Công viên Tao Đàn (cổng chính)",
                "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
                100000, "APPROVED", org3, sport, admin, null);

            Event e15 = mkEvent(eventRepo,
                "Giải Cầu lông Mở rộng Toàn quốc 2025",
                "Giải cầu lông phong trào dành cho mọi đối tượng từ 15 đến 65 tuổi. Chia nhóm theo độ tuổi và trình độ. Đơn nam, đơn nữ, đôi nam và đôi hỗn hợp. Giải thưởng tổng trị giá 50 triệu đồng.",
                LocalDate.of(2025, 4, 15), LocalTime.of(8, 0), LocalTime.of(20, 0),
                "PUBLISHED", "1 Lữ Gia, Phường 15, Quận 11, TP.HCM",
                10.7693, 106.6692, "Nhà thi đấu Phú Thọ, Sân trong nhà",
                "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
                80000, "APPROVED", org1, sport, admin, null);

            // ── Giáo dục ──────────────────────────────────────
            Event e16 = mkEvent(eventRepo,
                "Hội thảo Khởi nghiệp & Đổi mới Sáng tạo 2026",
                "Hội thảo quy tụ 30 nhà sáng lập startup chia sẻ hành trình thực chiến. Chủ đề: gọi vốn Series A/B, product-market fit, mở rộng thị trường quốc tế. Cơ hội networking 1-1 với hơn 50 nhà đầu tư VC.",
                LocalDate.of(2026, 7, 25), LocalTime.of(8, 30), LocalTime.of(18, 0),
                "PUBLISHED", "141 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM",
                10.7719, 106.7002, "Rex Hotel Saigon, Phòng hội nghị tầng 5",
                "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
                600000, "APPROVED", org2, edu, admin, null);

            Event e17 = mkEvent(eventRepo,
                "Seminar Tâm lý học Ứng dụng trong Công sở",
                "Seminar chuyên sâu về tâm lý học ứng dụng: quản lý stress, giao tiếp phi bạo lực (NVC), tâm lý an toàn trong đội nhóm, và kỹ thuật phục hồi sau burnout. Giảng viên TS. Tâm lý học với 20 năm kinh nghiệm.",
                LocalDate.of(2025, 4, 25), LocalTime.of(8, 0), LocalTime.of(17, 0),
                "PUBLISHED", "19-23 Công trường Lam Sơn, Bến Nghé, Quận 1, TP.HCM",
                10.7742, 106.7026, "Khách sạn Caravelle Saigon, Phòng Đông Dương",
                "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
                300000, "APPROVED", org3, edu, admin, null);

            Event e18 = mkEvent(eventRepo,
                "Workshop Kỹ năng Mềm Toàn diện Cho Sinh viên",
                "Workshop 2 ngày về kỹ năng mềm thiết yếu: thuyết trình, làm việc nhóm, quản lý thời gian GTD, viết CV và phỏng vấn xin việc. Cấp chứng chỉ hoàn thành được nhiều doanh nghiệp lớn công nhận.",
                LocalDate.of(2025, 5, 5), LocalTime.of(8, 0), LocalTime.of(17, 30),
                "PUBLISHED", "59C Nguyễn Đình Chiểu, Phường 6, Quận 3, TP.HCM",
                10.7621, 106.6823, "Trường Đại học Kinh tế TP.HCM, Hội trường B1",
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
                800000, "APPROVED", org3, edu, admin, null);

            Event e19 = mkEvent(eventRepo,
                "Hội thảo Khoa học Giáo dục Quốc tế 2025",
                "Hội thảo học thuật quốc tế về đổi mới giáo dục với 200+ nhà khoa học từ 20 quốc gia. Chủ đề: Giáo dục 4.0, học tập chủ động và ứng dụng AI trong dạy học. Báo cáo được đăng vào kỷ yếu có ISSN.",
                LocalDate.of(2025, 3, 20), LocalTime.of(8, 0), LocalTime.of(18, 0),
                "PUBLISHED", "Đường Hàn Thuyên, Phường Linh Trung, Thành phố Thủ Đức, TP.HCM",
                10.8769, 106.8027, "Đại học Quốc gia TP.HCM, Nhà điều hành",
                "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
                200000, "APPROVED", org3, edu, admin, null);

            Event e20 = mkEvent(eventRepo,
                "Khóa học Tiếng Anh Giao tiếp Cấp tốc",
                "Khóa học tiếng Anh giao tiếp 4 tuần cho người đi làm. Học buổi tối 3 buổi/tuần. Cam kết giao tiếp tự tin sau khóa học hoặc hoàn tiền 100%.",
                LocalDate.of(2026, 9, 1), LocalTime.of(18, 30), LocalTime.of(21, 0),
                "DRAFT", "14 Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
                10.7742, 106.7016, "Trung tâm Anh ngữ Apollo, Tầng 3",
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
                3000000, "PENDING", org1, edu, null, null);

            // ── Nghệ thuật ────────────────────────────────────
            Event e21 = mkEvent(eventRepo,
                "Triển lãm Nghệ thuật Đương đại Việt Nam 2026",
                "Triển lãm quy tụ 50 nghệ sĩ đương đại hàng đầu với 200+ tác phẩm hội họa, điêu khắc, installation art và media art. Kết hợp gặp gỡ nghệ sĩ hằng tuần, workshop thưởng thức nghệ thuật và auction từ thiện.",
                LocalDate.of(2026, 6, 20), LocalTime.of(9, 0), LocalTime.of(21, 0),
                "PUBLISHED", "97A Phó Đức Chính, Nguyễn Thái Bình, Quận 1, TP.HCM",
                10.7728, 106.6967, "Bảo tàng Mỹ thuật TP.HCM",
                "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800",
                100000, "APPROVED", org1, art, admin, null);

            Event e22 = mkEvent(eventRepo,
                "Triển lãm Nhiếp ảnh Thiên nhiên & Môi trường Việt Nam",
                "Triển lãm 300+ bức ảnh từ 80 nhiếp ảnh gia về thiên nhiên và môi trường Việt Nam. Ảnh in khổ lớn ngoài trời. Kết hợp tọa đàm bảo vệ môi trường và ra mắt photo book đặc biệt.",
                LocalDate.of(2026, 8, 15), LocalTime.of(8, 0), LocalTime.of(20, 0),
                "PUBLISHED", "Phạm Ngũ Lão, Phường Phạm Ngũ Lão, Quận 1, TP.HCM",
                10.7701, 106.6924, "Công viên 23 Tháng 9",
                "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
                50000, "APPROVED", org3, art, admin, null);

            Event e23 = mkEvent(eventRepo,
                "Lớp học Vẽ tranh Sơn dầu cho Người mới bắt đầu",
                "Lớp học 1 ngày cho tuyệt đối người mới. Toàn bộ vật liệu và khung vải được cung cấp. Học viên hoàn thành một bức tranh phong cảnh biển ngay trong buổi học dưới hướng dẫn của họa sĩ chuyên nghiệp.",
                LocalDate.of(2026, 6, 30), LocalTime.of(9, 0), LocalTime.of(16, 0),
                "PUBLISHED", "178 Võ Văn Tần, Phường 10, Quận 3, TP.HCM",
                10.7865, 106.6989, "Xưởng Nghệ thuật ArtSpace Sài Gòn, Tầng 2",
                "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800",
                600000, "APPROVED", org3, art, admin, null);

            Event e24 = mkEvent(eventRepo,
                "Workshop Nhiếp ảnh Chân dung Chuyên nghiệp",
                "Workshop 1 ngày cùng nhiếp ảnh gia 15 năm kinh nghiệm. Kỹ thuật ánh sáng tự nhiên và đèn flash, bố cục sáng tạo, hướng dẫn người mẫu và hậu kỳ Lightroom & Photoshop. Giới hạn 15 học viên để đảm bảo chất lượng.",
                LocalDate.of(2025, 4, 5), LocalTime.of(8, 30), LocalTime.of(17, 30),
                "PUBLISHED", "25 Trần Cao Vân, Phường 6, Quận 3, TP.HCM",
                10.7835, 106.6949, "Studio Nghệ thuật Kim Long, Tầng 1",
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
                800000, "APPROVED", org2, art, admin, null);

            // ══ TICKET TYPES ══════════════════════════════════

            // E1 – Đêm nhạc Acoustic
            TicketType tt1a = mkTT(ttRepo, e1, "Hạng VIP",    500000, 50);
            TicketType tt1b = mkTT(ttRepo, e1, "Hạng Thường", 200000, 200);
            TicketType tt1c = mkTT(ttRepo, e1, "Sinh viên",   150000, 100);

            // E2 – Festival Mùa Hè
            mkTT(ttRepo, e2, "Vé VIP 3 ngày",    1500000, 100);
            mkTT(ttRepo, e2, "Vé Thường 3 ngày",  800000, 500);
            mkTT(ttRepo, e2, "Vé Ngày lẻ",        300000, 1000);

            // E3 – Concert Rock (REJECTED)
            mkTT(ttRepo, e3, "VIP",    700000, 50);
            mkTT(ttRepo, e3, "Thường", 300000, 200);

            // E4 – Lễ hội Âm nhạc Đường phố
            TicketType tt4a = mkTT(ttRepo, e4, "Vé Trọn gói 3 ngày", 700000, 100);
            TicketType tt4b = mkTT(ttRepo, e4, "Vé Ngày lẻ",         300000, 500);

            // E5 – Jazz & Blues
            mkTT(ttRepo, e5, "Bàn VIP (4 người)", 2000000, 30);
            mkTT(ttRepo, e5, "Vé Thường",          500000, 200);

            // E6 – AI Workshop
            TicketType tt6a = mkTT(ttRepo, e6, "VIP (bao gồm bữa trưa)", 800000, 30);
            TicketType tt6b = mkTT(ttRepo, e6, "Tiêu chuẩn",             400000, 150);
            TicketType tt6c = mkTT(ttRepo, e6, "Sinh viên",              200000, 100);

            // E7 – React Workshop (PENDING)
            mkTT(ttRepo, e7, "Vé tham dự", 600000, 50);

            // E8 – Tech Summit
            mkTT(ttRepo, e8, "VIP Pass (2 ngày)",      3000000, 50);
            mkTT(ttRepo, e8, "Standard Pass (2 ngày)", 1500000, 200);
            mkTT(ttRepo, e8, "Day Pass (1 ngày)",       800000, 500);

            // E9 – Hackathon
            TicketType tt9a = mkTT(ttRepo, e9, "Đăng ký đội (4 người)", 600000, 25);
            TicketType tt9b = mkTT(ttRepo, e9, "Đăng ký cá nhân",       200000, 100);

            // E10 – Blockchain (PENDING)
            mkTT(ttRepo, e10, "VIP Delegate",      2000000, 20);
            mkTT(ttRepo, e10, "Standard Delegate", 1000000, 100);

            // E11 – Marathon
            TicketType tt11a = mkTT(ttRepo, e11, "Full Marathon 42km", 600000, 500);
            TicketType tt11b = mkTT(ttRepo, e11, "Half Marathon 21km", 400000, 800);
            TicketType tt11c = mkTT(ttRepo, e11, "Fun Run 10km",       200000, 1000);

            // E12 – Bóng đá
            TicketType tt12a = mkTT(ttRepo, e12, "Khán đài VIP",    100000, 100);
            TicketType tt12b = mkTT(ttRepo, e12, "Khán đài thường",  50000, 500);

            // E13 – Yoga Retreat
            mkTT(ttRepo, e13, "Trọn gói 2 ngày (phòng nghỉ & ăn uống)", 3000000, 30);
            mkTT(ttRepo, e13, "Vé Ngày (không phòng)",                   1500000, 50);

            // E14 – Chạy bộ từ thiện
            mkTT(ttRepo, e14, "Vé tham gia (áo + huy chương)", 200000, 500);

            // E15 – Cầu lông
            TicketType tt15a = mkTT(ttRepo, e15, "Khán đài VIP",    150000, 50);
            TicketType tt15b = mkTT(ttRepo, e15, "Khán đài thường",  80000, 200);

            // E16 – Khởi nghiệp
            mkTT(ttRepo, e16, "VIP (gala dinner)", 2000000, 30);
            mkTT(ttRepo, e16, "Tiêu chuẩn",         800000, 150);
            mkTT(ttRepo, e16, "Sinh viên",           300000, 100);

            // E17 – Tâm lý học
            TicketType tt17a = mkTT(ttRepo, e17, "Premium (tài liệu & bữa trưa)", 1200000, 20);
            TicketType tt17b = mkTT(ttRepo, e17, "Tiêu chuẩn",                     600000, 80);
            TicketType tt17c = mkTT(ttRepo, e17, "Sinh viên",                       300000, 50);

            // E18 – Kỹ năng mềm
            TicketType tt18a = mkTT(ttRepo, e18, "Full workshop 2 ngày (chứng chỉ)", 1500000, 30);
            TicketType tt18b = mkTT(ttRepo, e18, "1 ngày tự chọn",                    800000, 80);

            // E19 – Hội thảo Khoa học
            TicketType tt19a = mkTT(ttRepo, e19, "Diễn giả / Đại biểu VIP",     2000000, 15);
            TicketType tt19b = mkTT(ttRepo, e19, "Đại biểu thường",               500000, 100);
            TicketType tt19c = mkTT(ttRepo, e19, "Sinh viên / Nghiên cứu sinh",   200000, 150);

            // E20 – Tiếng Anh (PENDING)
            mkTT(ttRepo, e20, "Vé học viên", 3000000, 30);

            // E21 – Triển lãm Nghệ thuật
            mkTT(ttRepo, e21, "Vé VIP (khai mạc + guided tour)", 500000, 50);
            mkTT(ttRepo, e21, "Vé tham quan thường",             100000, 300);

            // E22 – Triển lãm Nhiếp ảnh
            mkTT(ttRepo, e22, "Vé tham quan", 50000, 500);

            // E23 – Vẽ tranh
            mkTT(ttRepo, e23, "Vé học viên (vật liệu + khung vải)", 800000, 20);

            // E24 – Workshop Nhiếp ảnh Chân dung
            TicketType tt24a = mkTT(ttRepo, e24, "Trọn gói (đèn flash + bữa trưa)", 2500000, 15);
            TicketType tt24b = mkTT(ttRepo, e24, "Cơ bản",                           1200000, 40);

            // ══ ORDERS + TICKETS (events quá khứ APPROVED) ══

            // ── E1: Đêm nhạc Acoustic (15/03/2025) ──────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e1, tt1b, 2, "CASH",  "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e1, tt1a, 1, "VNPAY", "Nguyen Thi Lan",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e1, tt1c, 3, "MOMO",  "Le Van Hung",       true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e1, tt1b, 1, "CASH",  "Tran Thi Hoa",      false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e1, tt1c, 2, "VNPAY", "Vo Van Nam",        true);

            // ── E4: Lễ hội Âm nhạc Đường phố (20/02/2025) ──
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e4, tt4a, 1, "VNPAY", "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e4, tt4b, 2, "CASH",  "Le Van Hung",       true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e4, tt4b, 3, "MOMO",  "Vo Van Nam",        false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att6, e4, tt4b, 1, "CASH",  "Dang Thi Thu",      true);

            // ── E6: Hội thảo AI (10/04/2025) ────────────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e6, tt6a, 1, "CASH",  "Nguyen Thi Lan", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e6, tt6b, 2, "VNPAY", "Le Van Hung",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e6, tt6c, 1, "MOMO",  "Tran Thi Hoa",  true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e6, tt6b, 1, "CASH",  "Vo Van Nam",    false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att6, e6, tt6c, 2, "VNPAY", "Dang Thi Thu",  true);

            // ── E9: Hackathon (10/05/2025) ───────────────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e9, tt9b, 1, "MOMO",  "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e9, tt9a, 1, "VNPAY", "Nguyen Thi Lan",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e9, tt9b, 1, "CASH",  "Le Van Hung",       false);

            // ── E11: Marathon (20/04/2025) ───────────────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e11, tt11a, 1, "VNPAY", "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e11, tt11b, 1, "CASH",  "Nguyen Thi Lan",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e11, tt11c, 1, "MOMO",  "Le Van Hung",       true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e11, tt11a, 1, "CASH",  "Tran Thi Hoa",      false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e11, tt11c, 2, "VNPAY", "Vo Van Nam",        true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att6, e11, tt11b, 1, "MOMO",  "Dang Thi Thu",      true);

            // ── E12: Bóng đá (25/03/2025) ───────────────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e12, tt12b, 2, "CASH",  "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e12, tt12a, 1, "VNPAY", "Nguyen Thi Lan",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e12, tt12b, 3, "CASH",  "Le Van Hung",       false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e12, tt12b, 2, "MOMO",  "Tran Thi Hoa",      true);

            // ── E15: Cầu lông (15/04/2025) ───────────────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e15, tt15a, 1, "CASH",  "Nguyen Thi Lan", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e15, tt15b, 2, "VNPAY", "Le Van Hung",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e15, tt15b, 1, "MOMO",  "Vo Van Nam",     false);

            // ── E17: Tâm lý học (25/04/2025) ─────────────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e17, tt17a, 1, "CASH",  "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e17, tt17b, 1, "VNPAY", "Nguyen Thi Lan",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e17, tt17b, 2, "MOMO",  "Tran Thi Hoa",      false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att6, e17, tt17c, 1, "CASH",  "Dang Thi Thu",      true);

            // ── E18: Workshop Kỹ năng mềm (05/05/2025) ───────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att2, e18, tt18a, 1, "VNPAY", "Nguyen Thi Lan", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e18, tt18b, 2, "CASH",  "Le Van Hung",    true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e18, tt18b, 1, "MOMO",  "Tran Thi Hoa",  false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e18, tt18a, 1, "CASH",  "Vo Van Nam",    true);

            // ── E19: Hội thảo Khoa học (20/03/2025) ──────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e19, tt19b, 1, "CASH",  "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att3, e19, tt19c, 1, "MOMO",  "Le Van Hung",       true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att4, e19, tt19b, 1, "VNPAY", "Tran Thi Hoa",      false);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att6, e19, tt19c, 2, "CASH",  "Dang Thi Thu",      true);

            // ── E24: Workshop Nhiếp ảnh (05/04/2025) ─────────
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att1, e24, tt24a, 1, "VNPAY", "Tran Thi Attendee", true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att5, e24, tt24b, 1, "CASH",  "Vo Van Nam",        true);
            mkOrder(reservationRepo, orderRepo, odRepo, ticketRepo, ocRepo, sysCom,
                att6, e24, tt24b, 1, "MOMO",  "Dang Thi Thu",      false);
        };
    }

    // ── Helper: tạo Event ─────────────────────────────────────
    private Event mkEvent(EventRepository repo,
                          String title, String description,
                          LocalDate date, LocalTime start, LocalTime end,
                          String status, String location,
                          double lat, double lng, String address,
                          String thumbnail, long minPriceVnd,
                          String approvalStatus,
                          User organizer, Category category,
                          User reviewedBy, String rejectionReason) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setEventDate(date);
        e.setStartTime(start);
        e.setEndTime(end);
        e.setStatus(status);
        e.setLocation(location);
        e.setLatitude(lat);
        e.setLongitude(lng);
        e.setAddressDetail(address);
        e.setThumbnail(thumbnail);
        e.setMinPrice(BigDecimal.valueOf(minPriceVnd));
        e.setApprovalStatus(approvalStatus);
        e.setOrganizer(organizer);
        e.setCategory(category);
        if (reviewedBy != null) {
            e.setReviewedBy(reviewedBy);
            e.setReviewedAt(Instant.now().minusSeconds(86400L * 7));
        }
        if (rejectionReason != null) {
            e.setRejectionReason(rejectionReason);
        }
        return repo.save(e);
    }

    // ── Helper: tạo TicketType ────────────────────────────────
    private TicketType mkTT(TicketTypeRepository repo, Event event,
                            String name, long priceVnd, int qty) {
        TicketType tt = new TicketType();
        tt.setEvent(event);
        tt.setName(name);
        tt.setPrice(BigDecimal.valueOf(priceVnd));
        tt.setQuantity(qty);
        return repo.save(tt);
    }

    // ── Helper: tạo Order + Tickets + Commission ──────────────
    private void mkOrder(TicketReservationRepository reservationRepo,
                         OrderRepository orderRepo,
                         OrderDetailRepository odRepo,
                         TicketRepository ticketRepo,
                         OrderCommissionRepository ocRepo,
                         Commission sysCom,
                         User attendee, Event event, TicketType ticketType,
                         int qty, String paymentMethod,
                         String attendeeName, boolean checkedIn) {

        BigDecimal unitPrice = ticketType.getPrice();
        BigDecimal total     = unitPrice.multiply(BigDecimal.valueOf(qty));

        // TicketReservation đã hoàn thành
        TicketReservation reservation = new TicketReservation();
        reservation.setUser(attendee);
        reservation.setTicketType(ticketType);
        reservation.setQuantity(qty);
        reservation.setExpiresAt(Instant.now().minusSeconds(3600));
        reservation.setStatus(ReservationStatus.PAID);
        reservation = reservationRepo.save(reservation);

        // Order PAID
        com.example.event_management_server.model.Order order = new com.example.event_management_server.model.Order();
        order.setUser(attendee);
        order.setTotalPrice(total);
        order.setPaymentStatus("PAID");
        order.setPaymentMethod(paymentMethod);
        order.setPaidAt(Instant.now().minusSeconds(86400L * 30));
        order.setTicketReservation(reservation);
        if (!"CASH".equals(paymentMethod)) {
            order.setGatewayOrderCode("GW-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        }
        order = orderRepo.save(order);

        // OrderDetail
        OrderDetail od = new OrderDetail();
        od.setOrder(order);
        od.setTicketType(ticketType);
        od.setQuantity(qty);
        od.setPrice(unitPrice);
        od = odRepo.save(od);

        // Tickets
        for (int i = 0; i < qty; i++) {
            Ticket ticket = new Ticket();
            ticket.setOrderDetail(od);
            ticket.setAttendee(attendee);
            ticket.setAttendeeName(attendeeName);
            ticket.setQrCode("QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase());
            ticket.setIsValid(true);
            ticket.setCheckinStatus(checkedIn);
            if (checkedIn) {
                ticket.setCheckinTime(Instant.now().minusSeconds(86400L * 28));
            }
            ticketRepo.save(ticket);
        }

        // OrderCommission
        BigDecimal comPct    = sysCom.getPercent();
        BigDecimal comAmount = total.multiply(comPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netAmount = total.subtract(comAmount);

        OrderCommission oc = new OrderCommission();
        oc.setOrder(order);
        oc.setOrganizer(event.getOrganizer());
        oc.setEvent(event);
        oc.setGrossAmount(total);
        oc.setCommissionPercent(comPct);
        oc.setCommissionAmount(comAmount);
        oc.setNetAmount(netAmount);
        oc.setCommission(sysCom);
        ocRepo.save(oc);
    }
}
