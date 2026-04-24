import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/event/:id',
    Component: EventDetailPage,
  },
  {
    path: '/ticket-detail',
    Component: TicketDetailPage,
  },
  {
    path: '/organizer-dashboard',
    Component: OrganizerDashboard,
  },
]);
