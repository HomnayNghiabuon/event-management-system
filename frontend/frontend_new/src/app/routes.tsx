import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/event/:id',
    Component: EventDetailPage,
  },
]);
