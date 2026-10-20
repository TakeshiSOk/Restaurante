import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { BrandLogo } from '../common/BrandLogo';
import { NotificationToast } from '../common/NotificationToast';
import { playAlertSound } from '../../lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  ChefHat,
  Banknote,
  UtensilsCrossed,
  Bike,
  Package,
  Users,
  Boxes,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    logout,
    settings,
    updateSettings,
    toggleTheme,
    cashSessions,
    createOrder,
    products,
    customers,
    lastActiveTimestamp,
    updateActivity,
  } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Detección de inactividad para bloqueo de terminal
  useEffect(() => {
    const handleUserActivity = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    const checkInterval = setInterval(() => {
      const timeoutMs = (settings.inactivityTimeoutMinutes || 15) * 60 * 1000;
      if (currentUser && Date.now() - lastActiveTimestamp > timeoutMs) {
        logout();
        navigate('/admin/login');
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(checkInterval);
    };
  }, [currentUser, lastActiveTimestamp, settings.inactivityTimeoutMinutes, updateActivity, logout, navigate]);

  // Verificación estricta de permisos según rol
  const roleAccessMap: Record<string, string[]> = {
    dueno: ['/admin', '/admin/pos', '/admin/pedidos', '/admin/cocina', '/admin/caja', '/admin/mesas', '/admin/domicilios', '/admin/productos', '/admin/clientes', '/admin/inventario', '/admin/gastos', '/admin/reportes', '/admin/configuracion'],
    cajero: ['/admin', '/admin/pos', '/admin/pedidos', '/admin/cocina', '/admin/caja', '/admin/mesas', '/admin/domicilios', '/admin/clientes'],
    cocinero: ['/admin/cocina'],
    domiciliario: ['/admin/domicilios'],
  };

  const isCurrentRouteAllowed = currentUser
    ? roleAccessMap[currentUser.role]?.includes(location.pathname) ?? false
    : false;

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }

    if (currentUser.role === 'cocinero' && location.pathname !== '/admin/cocina') {
      navigate('/admin/cocina', { replace: true });
    } else if (currentUser.role === 'domiciliario' && location.pathname !== '/admin/domicilios') {
      navigate('/admin/domicilios', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  // Simulador voluntario de pedidos web periódicos en modo demo
  useEffect(() => {
    if (!settings.simulatedOrdersActive) return;

    const interval = setInterval(() => {
      const sampleCust = customers[Math.floor(Math.random() * customers.length)];
      const pricedProducts = products.filter((p) => p.basePrice && p.basePrice > 0);
      const sampleProd = pricedProducts[Math.floor(Math.random() * Math.min(8, pricedProducts.length))];

      if (!sampleProd || !sampleCust) return;

      const orderItem = {
        id: `sim-item-${Date.now()}`,
        productId: sampleProd.id,
        name: sampleProd.name,
        addons: [],
        unitPrice: sampleProd.basePrice || 22000,
        quantity: 1,
        total: sampleProd.basePrice || 22000,
        readyInKitchen: false,
        station: (sampleProd.categoryId === 'pizzas' ? 'pizza' : 'parrilla') as 'pizza' | 'parrilla',
      };

      createOrder({
        origin: 'web',
        status: 'recibido',
        customer: {
          name: sampleCust.name,
          phone: sampleCust.phone,
          address: sampleCust.address,
        },
        items: [orderItem],
        subtotal: orderItem.total,
        discount: 0,
        deliveryFee: 3000,
        total: orderItem.total + 3000,
        payments: [{ method: 'nequi', amount: orderItem.total + 3000 }],
        notes: 'Pedido de prueba en modo demostración',
      });

      playAlertSound('order');
    }, 50000);

    return () => clearInterval(interval);
  }, [settings.simulatedOrdersActive, customers, products, createOrder]);

  if (!currentUser) return null;

  const activeCashSession = cashSessions.find((s) => s.status === 'abierta');

  // Grupos semánticos organizados: OPERACIÓN, GESTIÓN, CONTROL
  interface NavGroup {
    title: string;
    items: {
      to: string;
      label: string;
      icon: React.ReactNode;
      roles: string[];
    }[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'OPERACIÓN',
      items: [
        { to: '/admin', label: 'Resumen', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['dueno', 'cajero'] },
        { to: '/admin/pos', label: 'Punto de Venta (POS)', icon: <Store className="w-4 h-4" />, roles: ['dueno', 'cajero'] },
        { to: '/admin/pedidos', label: 'Pedidos (Comandas)', icon: <ShoppingBag className="w-4 h-4" />, roles: ['dueno', 'cajero'] },
        { to: '/admin/cocina', label: 'Cocina (KDS)', icon: <ChefHat className="w-4 h-4" />, roles: ['dueno', 'cajero', 'cocinero'] },
        { to: '/admin/domicilios', label: 'Domicilios & Reparto', icon: <Bike className="w-4 h-4" />, roles: ['dueno', 'cajero', 'domiciliario'] },
      ],
    },
    {
      title: 'GESTIÓN',
      items: [
        { to: '/admin/mesas', label: 'Mesas & Cuentas', icon: <UtensilsCrossed className="w-4 h-4" />, roles: ['dueno', 'cajero'] },
        { to: '/admin/clientes', label: 'Clientes & Fiados', icon: <Users className="w-4 h-4" />, roles: ['dueno', 'cajero'] },
        { to: '/admin/productos', label: 'Productos & Carta', icon: <Package className="w-4 h-4" />, roles: ['dueno'] },
        { to: '/admin/inventario', label: 'Inventario & Stock', icon: <Boxes className="w-4 h-4" />, roles: ['dueno'] },
        { to: '/admin/gastos', label: 'Gastos Operativos', icon: <Receipt className="w-4 h-4" />, roles: ['dueno'] },
      ],
    },
    {
      title: 'CONTROL',
      items: [
        { to: '/admin/caja', label: 'Caja & Turnos', icon: <Banknote className="w-4 h-4" />, roles: ['dueno', 'cajero'] },
        { to: '/admin/reportes', label: 'Reportes Financieros', icon: <BarChart3 className="w-4 h-4" />, roles: ['dueno'] },
        { to: '/admin/configuracion', label: 'Configuración & QR', icon: <Settings className="w-4 h-4" />, roles: ['dueno'] },
      ],
    },
  ];

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(currentUser.role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex flex-col font-sans">
      <NotificationToast />

      {/* Top Navbar */}
      <header className="bg-brand-surface border-b border-brand-border/70 sticky top-0 z-40 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 max-w-full mx-auto">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-brand-surface-light border border-brand-border text-zinc-300"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <BrandLogo size="sm" showTagline={false} />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Estado de Caja */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${
                activeCashSession
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeCashSession ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span>{activeCashSession ? 'Caja Abierta' : 'Caja Cerrada'}</span>
            </div>

            {/* Switch de pedidos simulados demo */}
            <button
              onClick={() =>
                updateSettings({ simulatedOrdersActive: !settings.simulatedOrdersActive })
              }
              title="Activar/desactivar pedidos demo automáticos"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
                settings.simulatedOrdersActive
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${settings.simulatedOrdersActive ? 'animate-bounce text-amber-400' : ''}`} />
              <span className="hidden md:inline font-medium">Pedidos Demo:</span>
              <span className="font-bold">{settings.simulatedOrdersActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* Tema Claro/Oscuro */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white"
              title="Alternar tema visual"
              aria-label="Cambiar tema visual"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Link al Menú Digital Público */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-zinc-300 hover:text-brand-orange font-semibold transition-colors"
            >
              <span>Ver Menú Digital</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Staff Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-brand-border/60">
              <div className="text-right hidden sm:block">
                <span className="font-bold block text-brand-cream text-xs leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-brand-orange uppercase font-semibold">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-brand-surface border-r border-brand-border/70 p-3 space-y-4 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-black tracking-wider text-brand-orange/80 uppercase">
                {group.title}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-md'
                        : 'text-brand-cream/70 hover:bg-brand-surface-light hover:text-brand-cream'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        {/* Mobile Slide-over Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/75" />
            <div className="relative w-72 bg-brand-surface border-r border-brand-border h-full p-4 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                  <BrandLogo size="sm" />
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-zinc-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-brand-border text-xs">
                  <div className="text-zinc-400">Sesión actual:</div>
                  <div className="font-bold text-brand-cream">{currentUser.name}</div>
                  <div className="text-brand-orange font-mono text-[10px] uppercase">
                    Rol: {currentUser.role}
                  </div>
                </div>

                <nav className="space-y-4 pt-1">
                  {filteredGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      <div className="px-2 py-0.5 text-[10px] font-black tracking-wider text-brand-orange/80 uppercase">
                        {group.title}
                      </div>
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/admin'}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white'
                                : 'text-brand-cream/75 hover:bg-brand-surface-light'
                            }`
                          }
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-brand-border">
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Outlet for Page Content with Route Authorization Guard */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0C0A09]">
          {isCurrentRouteAllowed ? (
            <Outlet />
          ) : (
            <div className="p-8 rounded-3xl bg-brand-surface border border-red-500/40 text-center max-w-lg mx-auto space-y-4 my-12">
              <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-bold text-brand-cream">Módulo No Autorizado</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                El perfil actual (<span className="text-brand-orange font-bold uppercase">{currentUser.role}</span>) no cuenta con permisos para acceder a esta sección.
              </p>
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-brand-orange text-black font-bold text-xs rounded-xl hover:bg-brand-amber transition-colors"
              >
                Volver a mi panel asignado
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Fixed Footer Disclaimer */}
      <footer className="bg-brand-surface border-t border-brand-border/60 py-2 px-4 text-center text-[10px] sm:text-xs text-zinc-500 select-none">
        ⚠️ Control de ventas y caja para Chaves Burguer. No sustituye facturación electrónica ni contabilidad.
      </footer>
    </div>
  );
};
