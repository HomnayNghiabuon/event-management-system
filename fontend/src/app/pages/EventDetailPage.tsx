import { useParams } from 'react-router';
import { Header } from '../components/Header';
import { EventDetail } from '../components/EventDetail';
import { Footer } from '../components/Footer';

// Extended event data with details
const eventDetailsData = {
  1: {
    id: '1',
    title: 'Lễ Hội Âm Nhạc Mùa Hè 2026',
    image: 'https://images.unsplash.com/photo-1568215425379-7a994872739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3NTA0NDY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '15 Th05, 2026',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Công Viên Trung Tâm Phú Mỹ Hưng, TP. Hồ Chí Minh',
    description: `Hãy tham gia sự kiện âm nhạc được mong đợi nhất mùa hè này! Lễ Hội Âm Nhạc Mùa Hè 2026 quy tụ những nghệ sĩ xuất sắc nhất từ khắp nơi trên thế giới mang đến một đêm nhạc, khiêu vũ và lễ hội khó quên.

Trải nghiệm những màn trình diễn đẳng cấp thế giới từ các nghệ sĩ trong và ngoài nước trên nhiều sân khấu khác nhau. Từ pop, rock, EDM đến indie, sự kiện hoành tráng này có đủ mọi thể loại âm nhạc dành cho tất cả mọi người.

Đặc điểm nổi bật của lễ hội:
• 5 sân khấu với các màn trình diễn liên tục
• Hơn 50 nghệ sĩ và ban nhạc
• Quầy thức ăn và đồ uống đa dạng
• Khu vực phòng chờ VIP độc quyền
• Hệ thống âm thanh, ánh sáng chuyên nghiệp
• Môi trường an toàn và an ninh

Đừng bỏ lỡ cơ hội tuyệt vời này để trở thành một phần của lễ hội âm nhạc lớn nhất mùa hè!`,
    ticketTypes: [
      {
        id: 't1',
        name: 'Vé Thường',
        price: 1000000,
        description: 'Khu vực đứng với tầm nhìn sân khấu tốt',
      },
      {
        id: 't2',
        name: 'Vé VIP',
        price: 3500000,
        description: 'Chỗ ngồi tốt nhất, gói quà tặng độc quyền',
      },
    ],
  },
  2: {
    id: '2',
    title: 'Đêm Nhạc K-Pop: Dream Concert',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzc0OTc3MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '22 Th05, 2026',
    startTime: '19:00',
    endTime: '22:30',
    location: 'Sân Vận Động Quốc Gia Mỹ Đình, Hà Nội',
    description: `Hãy sẵn sàng cho trải nghiệm K-Pop đỉnh cao! Dream Concert mang đến những ngôi sao K-Pop đình đám nhất đến Hà Nội trong một đêm duy nhất.

Sự kiện độc quyền này bao gồm nhiều nhóm nhạc K-Pop từng đoạt giải thưởng biểu diễn những bản hit lớn nhất của họ, những màn hợp tác đặc biệt và những màn trình diễn chưa từng thấy. Trải nghiệm năng lượng, niềm đam mê và sự phấn khích của K-Pop như chưa từng có!

Điểm nhấn sự kiện:
• Các nhóm nhạc thần tượng K-Pop hàng đầu
• Sự xuất hiện của các khách mời đặc biệt
• Giao lưu tương tác với fan
• Hàng hóa, quà lưu niệm chính thức
• Màn hình LED và hiệu ứng sân khấu
• Khu vực chụp ảnh chuyên nghiệp

Đây là cơ hội có một không hai dành cho người hâm mộ K-Pop tại Việt Nam!`,
    ticketTypes: [
      {
        id: 't1',
        name: 'Vé Thường',
        price: 1200000,
        description: 'Khu vực đứng với tầm nhìn sân khấu tốt',
      },
      {
        id: 't2',
        name: 'Vé VIP',
        price: 4500000,
        description: 'Chỗ ngồi tốt nhất, gói quà tặng độc quyền',
      },
    ],
  },
  3: {
    id: '3',
    title: 'Hội Thảo Digital Marketing',
    image: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzUwNDQ2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '10 Th04, 2026',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Saigon Innovation Hub, TP. Hồ Chí Minh',
    description: `Nắm vững các chiến lược tiếp thị kỹ thuật số mới nhất trong hội thảo cả ngày toàn diện này!

Được dẫn dắt bởi các chuyên gia trong ngành, hội thảo thực tế này bao gồm mọi thứ từ tiếp thị truyền thông xã hội đến SEO, sáng tạo nội dung và phân tích. Hoàn hảo cho các doanh nhân, chuyên gia tiếp thị và bất kỳ ai muốn nâng cao kỹ năng tiếp thị kỹ thuật số của mình.

Các chủ đề của hội thảo bao gồm:
• Chiến lược Tiếp thị Truyền thông Xã hội
• Tiếp thị Nội dung và Kể chuyện
• Cơ bản về SEO và SEM
• Các phương pháp hay nhất về Tiếp thị Email
• Phân tích và Ra quyết định dựa trên Dữ liệu
�� Tiếp thị Người ảnh hưởng
• Các nghiên cứu tình huống thực tế

Bao gồm bữa trưa, đồ uống giải khát, tài liệu hội thảo và giấy chứng nhận hoàn thành.`,
    ticketTypes: [
      {
        id: 't1',
        name: 'Vé Thường',
        price: 500000,
        description: 'Bao gồm tất cả tài liệu và bữa trưa',
      },
      {
        id: 't2',
        name: 'Vé VIP',
        price: 1000000,
        description: 'Chỗ ngồi cao cấp, tài liệu, bữa trưa và giấy chứng nhận',
      },
    ],
  },
};

export function EventDetailPage() {
  const { id } = useParams();
  const eventDetail = eventDetailsData[id as keyof typeof eventDetailsData];

  if (!eventDetail) {
    return (
      <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center bg-[#F5F7FA]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Không Tìm Thấy Sự Kiện</h1>
            <p className="text-gray-600 mb-6">Sự kiện bạn đang tìm kiếm không tồn tại.</p>
            <a
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Quay lại Sự kiện
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <EventDetail {...eventDetail} />
      <Footer />
    </div>
  );
}