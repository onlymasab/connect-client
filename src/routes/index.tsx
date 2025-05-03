import { RouteObject } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import ProtectedRoute from './ProtectedRoute.tsx';
import DashboardPage from '../pages/DashboardPage.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
];