import { RouteObject } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/layouts/MainLayout'; // 👈 new layout component
import DashboardPage from '@/pages/DashboardPage';
import ProductPage from '@/pages/ProductPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout /> {/* 👈 fixed layout here */}
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'product',
        element: <ProductPage />,
      },
      // Add more child routes here
    ],
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
];