import { useParams } from 'react-router';
import { Header } from '../components/Header';
import { EventDetail } from '../components/EventDetail';
import { Footer } from '../components/Footer';

// Extended event data with details
const eventDetailsData = {
  1: {
    id: '1',
    title: 'Summer Music Festival 2026',
    image: 'https://images.unsplash.com/photo-1568215425379-7a994872739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3NTA0NDY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    date: 'May 15, 2026',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
    location: 'Phu My Hung Central Park, Ho Chi Minh City',
    description: `Join us for the most anticipated music event of the summer! Summer Music Festival 2026 brings together the best artists from around the world for an unforgettable night of music, dance, and celebration.

Experience world-class performances from top international and local artists across multiple stages. From pop to rock, EDM to indie, there's something for everyone at this spectacular event.

The festival features:
• 5 different stages with non-stop performances
• Over 50 artists and bands
• Food trucks and beverage stations
• VIP lounges and exclusive areas
• Professional sound and lighting systems
• Safe and secure environment

Don't miss this incredible opportunity to be part of the summer's biggest music celebration!`,
    ticketTypes: [
      {
        id: 't1',
        name: 'Regular Ticket',
        price: 55,
        description: 'Standing area with great stage view',
      },
      {
        id: 't2',
        name: 'VIP Pass',
        price: 150,
        description: 'Best seats, exclusive merchandise package',
      },
    ],
  },
  2: {
    id: '2',
    title: 'K-Pop Night: Dream Concert',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzc0OTc3MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    date: 'May 22, 2026',
    startTime: '7:00 PM',
    endTime: '10:30 PM',
    location: 'My Dinh National Stadium, Hanoi',
    description: `Get ready for the ultimate K-Pop experience! Dream Concert brings the hottest K-Pop stars to Hanoi for one spectacular night.

This exclusive event features multiple award-winning K-Pop groups performing their biggest hits, special collaborations, and never-before-seen performances. Experience the energy, passion, and excitement of K-Pop like never before!

Event highlights:
• Top K-Pop idol groups
• Special guest appearances
• Interactive fan engagement
• Official merchandise available
• LED screens and stage effects
• Professional photography zones

This is a once-in-a-lifetime opportunity for K-Pop fans in Vietnam!`,
    ticketTypes: [
      {
        id: 't1',
        name: 'Regular Ticket',
        price: 55,
        description: 'Standing area with great stage view',
      },
      {
        id: 't2',
        name: 'VIP Pass',
        price: 180,
        description: 'Best seats, exclusive merchandise package',
      },
    ],
  },
  3: {
    id: '3',
    title: 'Digital Marketing Workshop',
    image: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzUwNDQ2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: 'April 10, 2026',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    location: 'Saigon Innovation Hub, Ho Chi Minh City',
    description: `Master the latest digital marketing strategies in this comprehensive full-day workshop!

Led by industry experts, this hands-on workshop covers everything from social media marketing to SEO, content creation, and analytics. Perfect for entrepreneurs, marketing professionals, and anyone looking to enhance their digital marketing skills.

Workshop topics include:
• Social Media Marketing Strategy
• Content Marketing and Storytelling
• SEO and SEM fundamentals
• Email Marketing Best Practices
• Analytics and Data-Driven Decisions
• Influencer Marketing
• Practical Case Studies

Includes lunch, refreshments, workshop materials, and a certificate of completion.`,
    ticketTypes: [
      {
        id: 't1',
        name: 'Regular Ticket',
        price: 25,
        description: 'Includes all materials and lunch',
      },
      {
        id: 't2',
        name: 'VIP Pass',
        price: 50,
        description: 'Premium seating, materials, lunch, and certificate',
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
            <a
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Back to Events
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