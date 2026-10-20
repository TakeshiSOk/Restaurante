import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { DigitalMenuPage } from './pages/public/DigitalMenuPage';
import { OrderTrackingPage } from './pages/public/OrderTrackingPage';

// Admin Layout & Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { PosPage } from './pages/admin/PosPage';
import { OrdersKanbanPage } from './pages/admin/OrdersKanbanPage';
import { KitchenKdsPage } from './pages/admin/KitchenKdsPage';
import { CashRegisterPage } from './pages/admin/CashRegisterPage';
import { TablesAndAccountsPage } from './pages/admin/TablesAndAccountsPage';
import { DeliveryManagementPage } from './pages/admin/DeliveryManagementPage';
import { ProductsAdminPage } from './pages/admin/ProductsAdminPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { ExpensesPage } from './pages/admin/ExpensesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsAdminPage } from './pages/admin/SettingsAdminPage';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas para Clientes / QR de Mesa */}
          <Route path="/" element={<DigitalMenuPage />} />
          <Route path="/pedido/:code" element={<OrderTrackingPage />} />

          {/* Login Simulado de Administración */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Panel de Administración y Punto de Venta */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="pedidos" element={<OrdersKanbanPage />} />
            <Route path="cocina" element={<KitchenKdsPage />} />
            <Route path="caja" element={<CashRegisterPage />} />
            <Route path="mesas" element={<TablesAndAccountsPage />} />
            <Route path="domicilios" element={<DeliveryManagementPage />} />
            <Route path="productos" element={<ProductsAdminPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="inventario" element={<InventoryPage />} />
            <Route path="gastos" element={<ExpensesPage />} />
            <Route path="reportes" element={<ReportsPage />} />
            <Route path="configuracion" element={<SettingsAdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
