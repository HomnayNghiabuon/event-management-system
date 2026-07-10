import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './components/ProtectedRoute'

import { HomePage } from './pages/public/HomePage'
import { EventDetailPage } from './pages/public/EventDetailPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { PaymentReturnPage } from './pages/public/PaymentReturnPage'

import { MyTicketsPage } from './pages/attendee/MyTicketsPage'
import { TicketDetailPage } from './pages/attendee/TicketDetailPage'
import { MyOrdersPage } from './pages/attendee/MyOrdersPage'
import { OrderDetailPage } from './pages/attendee/OrderDetailPage'
import { MySchedulePage } from './pages/attendee/MySchedulePage'
import { NotificationsPage } from './pages/attendee/NotificationsPage'
import { ProfilePage } from './pages/attendee/ProfilePage'

import { MyEventsPage } from './pages/organizer/MyEventsPage'
import { CreateEventPage } from './pages/organizer/CreateEventPage'
import { EditEventPage } from './pages/organizer/EditEventPage'
import { EventAttendeesPage } from './pages/organizer/EventAttendeesPage'
import { EventStatsPage } from './pages/organizer/EventStatsPage'
import { CheckInPage } from './pages/organizer/CheckInPage'
import { RevenuePage } from './pages/organizer/RevenuePage'

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminEventsPage } from './pages/admin/AdminEventsPage'
import { AdminOrganizersPage } from './pages/admin/AdminOrganizersPage'
import { AdminCommissionsPage } from './pages/admin/AdminCommissionsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminRevenuePage } from './pages/admin/AdminRevenuePage'
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage'

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <HomePage /> },
  { path: '/event/:id', element: <EventDetailPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/payment/return', element: <PaymentReturnPage /> },

  // Attendee
  {
    path: '/my-tickets',
    element: <ProtectedRoute roles={['ATTENDEE']}><MyTicketsPage /></ProtectedRoute>,
  },
  {
    path: '/my-tickets/:ticketId',
    element: <ProtectedRoute roles={['ATTENDEE']}><TicketDetailPage /></ProtectedRoute>,
  },
  {
    path: '/my-orders',
    element: <ProtectedRoute roles={['ATTENDEE']}><MyOrdersPage /></ProtectedRoute>,
  },
  {
    path: '/my-orders/:orderId',
    element: <ProtectedRoute roles={['ATTENDEE']}><OrderDetailPage /></ProtectedRoute>,
  },
  {
    path: '/my-schedule',
    element: <ProtectedRoute roles={['ATTENDEE']}><MySchedulePage /></ProtectedRoute>,
  },
  {
    path: '/notifications',
    element: <ProtectedRoute roles={['ATTENDEE', 'ORGANIZER', 'ADMIN']}><NotificationsPage /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute roles={['ATTENDEE', 'ORGANIZER', 'ADMIN']}><ProfilePage /></ProtectedRoute>,
  },

  // Organizer
  {
    path: '/organizer',
    element: <ProtectedRoute roles={['ORGANIZER']}><MyEventsPage /></ProtectedRoute>,
  },
  {
    path: '/organizer/events/create',
    element: <ProtectedRoute roles={['ORGANIZER']}><CreateEventPage /></ProtectedRoute>,
  },
  {
    path: '/organizer/events/:id/edit',
    element: <ProtectedRoute roles={['ORGANIZER']}><EditEventPage /></ProtectedRoute>,
  },
  {
    path: '/organizer/events/:id/attendees',
    element: <ProtectedRoute roles={['ORGANIZER']}><EventAttendeesPage /></ProtectedRoute>,
  },
  {
    path: '/organizer/events/:id/stats',
    element: <ProtectedRoute roles={['ORGANIZER']}><EventStatsPage /></ProtectedRoute>,
  },
  {
    path: '/organizer/checkin',
    element: <ProtectedRoute roles={['ORGANIZER']}><CheckInPage /></ProtectedRoute>,
  },
  {
    path: '/organizer/revenue',
    element: <ProtectedRoute roles={['ORGANIZER']}><RevenuePage /></ProtectedRoute>,
  },

  // Admin
  {
    path: '/admin',
    element: <ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>,
  },
  {
    path: '/admin/events',
    element: <ProtectedRoute roles={['ADMIN']}><AdminEventsPage /></ProtectedRoute>,
  },
  {
    path: '/admin/organizers',
    element: <ProtectedRoute roles={['ADMIN']}><AdminOrganizersPage /></ProtectedRoute>,
  },
  {
    path: '/admin/commissions',
    element: <ProtectedRoute roles={['ADMIN']}><AdminCommissionsPage /></ProtectedRoute>,
  },
  {
    path: '/admin/categories',
    element: <ProtectedRoute roles={['ADMIN']}><AdminCategoriesPage /></ProtectedRoute>,
  },
  {
    path: '/admin/revenue',
    element: <ProtectedRoute roles={['ADMIN']}><AdminRevenuePage /></ProtectedRoute>,
  },
  {
    path: '/admin/notifications',
    element: <ProtectedRoute roles={['ADMIN']}><AdminNotificationsPage /></ProtectedRoute>,
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
