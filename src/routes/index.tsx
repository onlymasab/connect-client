import { RouteObject } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import ProductPage from '@/pages/ProductPage';
import ProductionPage from '@/pages/ProductionPage';
import MaterialPage from '@/pages/MaterialPage';
import InvoicePage from '@/pages/InvoicePage';
import DispatchPage from '@/pages/DispatchPage';
import ReturnPage from '@/pages/ReturnPage';
import InventoryPage from '@/pages/InventoryPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // this is the default route for "/"
        element: <DashboardPage />,
      },
      {
        path: 'product', // renders at "/product"
        element: <ProductPage />,
      },
      {
        path: 'production', // renders at "/product"
        element: <ProductionPage />,
      },
      {
        path: 'material', // renders at "/product"
        element: <MaterialPage />,
      },{
        path: 'invoice', // renders at "/product"
        element: <InvoicePage />,
      },
      {
        path: 'dispatch', // renders at "/product"
        element: <DispatchPage />,
      },
      {
        path: 'return', // renders at "/product"
        element: <ReturnPage />,
      },
      {
        path: 'inventory', // renders at "/product"
        element: <InventoryPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
];