import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

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
]);
