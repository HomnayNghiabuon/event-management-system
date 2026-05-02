import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './components/ProtectedRoute'

import { HomePage } from './pages/public/HomePage'
import { EventDetailPage } from './pages/public/EventDetailPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'

import { MyTicketsPage } from './pages/attendee/MyTicketsPage'
import { MyOrdersPage } from './pages/attendee/MyOrdersPage'
import { NotificationsPage } from './pages/attendee/NotificationsPage'
import { ProfilePage } from './pages/attendee/ProfilePage'

import { MyEventsPage } from './pages/organizer/MyEventsPage'
import { CreateEventPage } from './pages/organizer/CreateEventPage'
import { EditEventPage } from './pages/organizer/EditEventPage'
import { EventAttendeesPage } from './pages/organizer/EventAttendeesPage'
import { EventStatsPage } from './pages/organizer/EventStatsPage'
import { CheckInPage } from './pages/organizer/CheckInPage'

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminEventsPage } from './pages/admin/AdminEventsPage'
import { AdminOrganizersPage } from './pages/admin/AdminOrganizersPage'
import { AdminCommissionsPage } from './pages/admin/AdminCommissionsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <HomePage /> },
  { path: '/event/:id', element: <EventDetailPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Attendee
  {
    path: '/my-tickets',
    element: <ProtectedRoute roles={['ATTENDEE']}><MyTicketsPage /></ProtectedRoute>,
  },
  {
    path: '/my-orders',
    element: <ProtectedRoute roles={['ATTENDEE']}><MyOrdersPage /></ProtectedRoute>,
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

  { path: '*', element: <Navigate to="/" replace /> },
])