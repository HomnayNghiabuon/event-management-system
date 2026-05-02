import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrganizers } from './pages/admin/AdminOrganizers';

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
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'events', Component: AdminEvents },
      { path: 'categories', Component: AdminCategories },
      { path: 'organizers', Component: AdminOrganizers },
      { path: 'reports', Component: AdminDashboard }, // Reuse dashboard for reports
    ],
  },
]);
