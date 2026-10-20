import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Staff } from '../../types';
import { formatCurrency, formatTime, formatTimeAgo } from '../../lib/utils';
import { StatusBadge, PaymentMethodBadge } from '../../components/common/Badge';
import {
  Bike,
  MapPin,
  Clock,
  User,
  Phone,
  MessageCircle,
  Plus,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  Edit3,
  Power,
  X,
  Wallet,
  DollarSign,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const DeliveryManagementPage: React.FC = () => {
  const {
    orders,
    settings,
    staff,
    addStaff,
    updateStaff,
    assignDriver,
    updateOrderStatus,
    setNotification,
    currentUser,
  } = useAppStore();

  const isDriver = currentUser?.role === 'domiciliario';

  // Pestañas
  const [activeTab, setActiveTab] = useState<'deliveries' | 'history' | 'drivers' | 'zones'>('deliveries');

  // Filtros de historial
  const [historyDriverFilter, setHistoryDriverFilter] = useState<string>('all');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');
  const [historyZoneFilter, setHistoryZoneFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Modal para crear / editar domiciliario
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Staff | null>(null);
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    vehiclePlate: '',
    pin: '1234',
    active: true,
  });

  // Lista de domiciliarios
  const allDrivers = staff.filter((s) => s.role === 'domiciliario');
  const activeDeliveryDrivers = allDrivers.filter((s) => s.active);

  // Todos los pedidos que corresponden a entregas a domicilio
  const deliveryOrders = useMemo(() => {
    return orders.filter(
      (o) => o.origin === 'domicilio' || Boolean(o.customer?.address && o.customer.address.trim().length > 0)
    );
  }, [orders]);

  // Pedidos activos (en cocina, listos o en camino)
  const activeDeliveries = useMemo(() => {
    return deliveryOrders
      .filter((o) => {
        const isPending = o.status === 'en_cocina' || o.status === 'listo' || o.status === 'en_camino';
        if (!isPending) return false;
        if (isDriver) {
          return o.driverId === currentUser?.id;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
  }, [deliveryOrders, isDriver, currentUser?.id]);

  // Historial filtrado de pedidos a domicilio
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    return deliveryOrders
      .filter((o) => {
        // En historial mostramos principalmente entregados o cancelados, o todos si se desea
        // Filtro por repartidor
        if (historyDriverFilter !== 'all' && o.driverId !== historyDriverFilter) {
          return false;
        }

        // Filtro por periodo
        const orderDate = new Date(o.createdAt);
        if (historyPeriodFilter === 'today' && orderDate.toDateString() !== todayStr) {
          return false;
        }
        if (historyPeriodFilter === '7days' && orderDate < sevenDaysAgo) {
          return false;
        }
        if (historyPeriodFilter === 'month' && orderDate < thirtyDaysAgo) {
          return false;
        }

        // Filtro por zona
        if (historyZoneFilter !== 'all' && o.customer.zoneName !== historyZoneFilter) {
          return false;
        }

        // Búsqueda por texto (código, cliente, dirección)
        if (historySearch.trim()) {
          const q = historySearch.toLowerCase();
          const matchCode = o.code.toLowerCase().includes(q);
          const matchName = o.customer.name.toLowerCase().includes(q);
          const matchAddress = o.customer.address?.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchAddress) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [deliveryOrders, historyDriverFilter, historyPeriodFilter, historyZoneFilter, historySearch]);

  // Métricas del historial filtrado (Cuadre de dinero en calle para domiciliarios)
  const historyMetrics = useMemo(() => {
    const completed = filteredHistory.filter((o) => o.status === 'entregado');
    const totalDeliveries = completed.length;

    let cashCollected = 0;
    let digitalCollected = 0;
    let totalSales = 0;

    completed.forEach((o) => {
      totalSales += o.total;
      const isCash = o.payments.some((p) => p.method === 'efectivo');
      if (isCash) {
        cashCollected += o.total;
      } else {
        digitalCollected += o.total;
      }
    });

    return {
      totalDeliveries,
      cashCollected,
      digitalCollected,
      totalSales,
    };
  }, [filteredHistory]);

  // Manejo de avance de estado de entrega
  const handleAdvanceDelivery = (orderId: string, currentStatus: string) => {
    if (currentStatus === 'listo') {
      updateOrderStatus(orderId, 'en_camino');
      setNotification({ message: 'Pedido despachado En Camino con el domiciliario.', type: 'info' });
    } else if (currentStatus === 'en_camino') {
      updateOrderStatus(orderId, 'entregado');
      setNotification({ message: 'Domicilio entregado exitosamente al cliente.', type: 'success' });
    }
  };

  // Abrir modal para crear nuevo domiciliario
  const handleOpenCreateDriver = () => {
    setEditingDriver(null);
    setDriverForm({
      name: '',
      phone: '',
      vehiclePlate: '',
      pin: '1234',
      active: true,
    });
    setDriverModalOpen(true);
  };

  // Abrir modal para editar domiciliario existente
  const handleOpenEditDriver = (driver: Staff) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      phone: driver.phone,
      vehiclePlate: driver.vehiclePlate || '',
      pin: driver.pin,
      active: driver.active,
    });
    setDriverModalOpen(true);
  };

  // Guardar domiciliario (crear o actualizar)
  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForm.name.trim() || !driverForm.phone.trim()) {
      alert('Por favor completa el nombre y celular del domiciliario.');
      return;
    }

    if (editingDriver) {
      updateStaff(editingDriver.id, {
        name: driverForm.name.trim(),
        phone: driverForm.phone.trim(),
        vehiclePlate: driverForm.vehiclePlate.trim() || undefined,
        pin: driverForm.pin.trim() || '1234',
        active: driverForm.active,
      });
      setNotification({
        message: `Domiciliario "${driverForm.name}" actualizado correctamente.`,
        type: 'success',
      });
    } else {
      addStaff({
        name: driverForm.name.trim(),
        role: 'domiciliario',
        phone: driverForm.phone.trim(),
        vehiclePlate: driverForm.vehiclePlate.trim() || undefined,
        pin: driverForm.pin.trim() || '1234',
        active: driverForm.active,
      });
      setNotification({
        message: `Domiciliario "${driverForm.name}" agregado con éxito.`,
        type: 'success',
      });
    }

    setDriverModalOpen(false);
  };

  // Alternar estado activo / inactivo de un domiciliario
  const handleToggleDriverActive = (driver: Staff) => {
    updateStaff(driver.id, { active: !driver.active });
    setNotification({
      message: `Domiciliario ${driver.name} marcado como ${!driver.active ? 'Activo' : 'Inactivo'}.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Despacho & Domicilios
          </h1>
          <p className="text-xs text-zinc-400">
            Control de repartidores, pedidos en ruta, historial de entregas y cuadre de efectivo
          </p>
        </div>

        {!isDriver && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-brand-surface rounded-2xl border border-brand-border">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'deliveries'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>En Curso ({activeDeliveries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Historial ({deliveryOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'drivers'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Domiciliarios ({allDrivers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('zones')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'zones'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Zonas & Tarifas ({settings.deliveryZones.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. PESTAÑA: DOMICILIOS EN CURSO */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          {/* Driver Metric Cards (Vista general de domiciliarios en turno) */}
          {!isDriver && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDrivers.map((driver) => {
                const driverOrders = deliveryOrders.filter((o) => o.driverId === driver.id && o.status === 'entregado');
                const inRouteCount = activeDeliveries.filter((o) => o.driverId === driver.id && o.status === 'en_camino').length;

                return (
                  <div
                    key={driver.id}
                    className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          driver.active ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-brand-cream">{driver.name}</h4>
                          <span className="text-[10px] text-zinc-400 block">
                            {driver.vehiclePlate ? `🛵 ${driver.vehiclePlate}` : `Tel: ${driver.phone}`}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        driver.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {driver.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-brand-border/50 text-xs">
                      <span className="text-zinc-400">En ruta ahora:</span>
                      <span className="font-bold text-brand-orange">{inRouteCount} pedidos</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-zinc-400">Total completados:</span>
                      <span className="font-bold text-brand-cream">{driverOrders.length} pedidos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Deliveries List */}
          <div className="bg-brand-surface border border-brand-border/70 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-bold text-sm text-brand-cream">Pedidos a Domicilio en Curso</h3>
                <p className="text-xs text-zinc-400">Órdenes esperando despacho o en ruta hacia el cliente</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-surface-light border border-brand-border text-xs font-black text-brand-orange">
                {activeDeliveries.length} activos
              </span>
            </div>

            {activeDeliveries.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
                <Bike className="w-10 h-10 mx-auto text-zinc-600 stroke-[1.5]" />
                <p>No hay pedidos a domicilio pendientes en este momento.</p>
                <p className="text-[11px] text-zinc-600">
                  Los nuevos pedidos que entren por la Web o el POS con modalidad domicilio aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeDeliveries.map((order) => {
                  const assignedDriverObj = allDrivers.find((d) => d.id === order.driverId);

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-brand-surface-light border border-brand-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-brand-orange/40 transition-all"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-brand-orange text-sm">
                            {order.code}
                          </span>
                          <StatusBadge status={order.status} size="sm" />
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(order.createdAt)} ({formatTimeAgo(order.createdAt)})
                          </span>
                        </div>

                        <div className="font-bold text-sm text-brand-cream">{order.customer.name}</div>

                        <div className="text-zinc-300 flex items-center gap-1.5 flex-wrap">
                          <MapPin className="w-3.5 h-3.5 text-brand-red-light shrink-0" />
                          <span className="font-semibold text-white">
                            {order.customer.address || 'Sin dirección registrada'}
                          </span>
                          {order.customer.zoneName && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-surface text-[10px] text-brand-orange font-bold border border-brand-border">
                              {order.customer.zoneName}
                            </span>
                          )}
                        </div>

                        {order.notes && (
                          <div className="text-[11px] text-amber-300 italic">
                            Nota: {order.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 block">Total a Cobrar:</span>
                          <span className="font-black text-base text-brand-cream">
                            {formatCurrency(order.total)}
                          </span>
                          <div className="mt-0.5">
                            {order.payments[0] ? (
                              <PaymentMethodBadge method={order.payments[0].method} />
                            ) : (
                              <span className="text-[10px] text-zinc-500">Pendiente</span>
                            )}
                          </div>
                        </div>

                        {/* Driver select */}
                        <div className="min-w-[170px]">
                          <select
                            value={order.driverId || ''}
                            onChange={(e) => {
                              const driver = allDrivers.find((d) => d.id === e.target.value);
                              if (driver) assignDriver(order.id, driver.id, driver.name);
                            }}
                            className="w-full p-2 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                          >
                            <option value="">Asignar Domiciliario</option>
                            {allDrivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} {d.active ? '' : '(Inactivo)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Advance Button */}
                        {order.status === 'listo' && (
                          <button
                            onClick={() => handleAdvanceDelivery(order.id, order.status)}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Despachar (En Ruta)</span>
                          </button>
                        )}

                        {order.status === 'en_camino' && (
                          <button
                            onClick={() => handleAdvanceDelivery(order.id, order.status)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Marcar Entregado</span>
                          </button>
                        )}

                        {/* Botón WhatsApp al Cliente */}
                        <a
                          href={`https://wa.me/57${order.customer.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customer.name)},%20tu%20pedido%20${order.code}%20de%20Chaves%20Burguer%20va%20en%20camino%20a%20tu%20dirección:%20${encodeURIComponent(order.customer.address || '')}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 transition-colors"
                          title="Enviar WhatsApp al cliente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Botón WhatsApp al Domiciliario con la comanda y dirección */}
                        {assignedDriverObj && (
                          <a
                            href={`https://wa.me/57${assignedDriverObj.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(assignedDriverObj.name)},%20entrega%20el%20pedido%20${order.code}%20al%20cliente%20${encodeURIComponent(order.customer.name)}%20en%20${encodeURIComponent(order.customer.address || '')}.%20Total%20a%20cobrar:%20${encodeURIComponent(formatCurrency(order.total))}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 transition-colors"
                            title={`Enviar datos por WhatsApp a ${assignedDriverObj.name}`}
                          >
                            <Bike className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PESTAÑA: HISTORIAL & CUADRE DE DOMICILIOS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Barra de Filtros */}
          <div className="p-4 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-orange uppercase">
              <Filter className="w-4 h-4" />
              <span>Filtros del Historial de Domicilios</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Filtro Domiciliario */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Domiciliario:</label>
                <select
                  value={historyDriverFilter}
                  onChange={(e) => setHistoryDriverFilter(e.target.value)}
                  className="w-full p-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                >
                  <option value="all">Todos los domiciliarios</option>
                  {allDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Periodo */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Periodo de tiempo:</label>
                <select
                  value={historyPeriodFilter}
                  onChange={(e) => setHistoryPeriodFilter(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                >
                  <option value="all">Todo el historial (30 días)</option>
                  <option value="today">Solo hoy</option>
                  <option value="7days">Últimos 7 días</option>
                  <option value="month">Últimos 30 días</option>
                </select>
              </div>

              {/* Filtro Zona */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Zona de entrega:</label>
                <select
                  value={historyZoneFilter}
                  onChange={(e) => setHistoryZoneFilter(e.target.value)}
                  className="w-full p-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                >
                  <option value="all">Todas las zonas</option>
                  {settings.deliveryZones.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Búsqueda por código o cliente */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Buscar por código/cliente:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="CH-0230, Carlos..."
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de Resumen & Cuadre de Efectivo para Domiciliarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 shadow-sm space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">Domicilios Entregados</span>
              <div className="text-2xl font-black text-brand-cream flex items-center justify-between">
                <span>{historyMetrics.totalDeliveries}</span>
                <Bike className="w-5 h-5 text-brand-orange" />
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {historyDriverFilter !== 'all' ? 'Para el domiciliario seleccionado' : 'Total acumulado'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-sm space-y-1">
              <span className="text-[11px] text-emerald-400 block font-medium">Efectivo Cobrado en la Calle</span>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-between">
                <span>{formatCurrency(historyMetrics.cashCollected)}</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] text-emerald-500/80 block">
                Dinero en mano que debe ingresar a caja
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 shadow-sm space-y-1">
              <span className="text-[11px] text-purple-300 block font-medium">Pagos Digitales (Nequi / Daviplata)</span>
              <div className="text-2xl font-black text-purple-300 flex items-center justify-between">
                <span>{formatCurrency(historyMetrics.digitalCollected)}</span>
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[10px] text-purple-400/80 block">
                Cobrado previamente por el negocio
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 shadow-sm space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">Total Facturado</span>
              <div className="text-2xl font-black text-brand-orange flex items-center justify-between">
                <span>{formatCurrency(historyMetrics.totalSales)}</span>
                <ShieldCheck className="w-5 h-5 text-brand-orange" />
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Ventas de comida + costo de domicilio
              </span>
            </div>
          </div>

          {/* Tabla de Historial Detallado */}
          <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-brand-border/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-brand-cream">Registro de Entregas</h3>
                <p className="text-xs text-zinc-400">
                  Mostrando {filteredHistory.length} pedidos encontrados con los filtros actuales
                </p>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs">
                No se encontraron domicilios con los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
                    <tr>
                      <th className="p-3.5">CÓDIGO</th>
                      <th className="p-3.5">FECHA Y HORA</th>
                      <th className="p-3.5">DOMICILIARIO</th>
                      <th className="p-3.5">CLIENTE Y DIRECCIÓN</th>
                      <th className="p-3.5">MÉTODO PAGO</th>
                      <th className="p-3.5">ESTADO</th>
                      <th className="p-3.5 text-right">TOTAL</th>
                      <th className="p-3.5 text-center">CONTACTO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {filteredHistory.slice(0, 40).map((order) => {
                      const isCash = order.payments.some((p) => p.method === 'efectivo');

                      return (
                        <tr key={order.id} className="hover:bg-brand-surface-light/50 transition-colors">
                          <td className="p-3.5 font-mono font-black text-brand-orange">
                            {order.code}
                          </td>
                          <td className="p-3.5 text-zinc-400 whitespace-nowrap">
                            <div>{new Date(order.createdAt).toLocaleDateString('es-CO')}</div>
                            <div className="text-[10px] text-zinc-500">{formatTime(order.createdAt)}</div>
                          </td>
                          <td className="p-3.5">
                            {order.driverName ? (
                              <div className="flex items-center gap-1.5 font-bold text-brand-cream">
                                <Bike className="w-3.5 h-3.5 text-brand-orange" />
                                <span>{order.driverName}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic">Sin repartidor asignado</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-brand-cream">{order.customer.name}</div>
                            <div className="text-[11px] text-zinc-400 line-clamp-1">
                              📍 {order.customer.address || 'Sin dirección'}
                            </div>
                            {order.customer.zoneName && (
                              <span className="text-[10px] text-brand-orange font-semibold">
                                {order.customer.zoneName}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {order.payments[0] ? (
                              <div className="space-y-0.5">
                                <PaymentMethodBadge method={order.payments[0].method} />
                                {isCash && (
                                  <span className="text-[10px] text-emerald-400 block font-semibold">
                                    Cobrar en efectivo
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-500">Pendiente</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={order.status} size="sm" />
                          </td>
                          <td className="p-3.5 text-right font-black text-brand-cream">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="p-3.5 text-center">
                            <a
                              href={`https://wa.me/57${order.customer.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customer.name)},%20te%20saludamos%20de%20Chaves%20Burguer%20sobre%20tu%20pedido%20${order.code}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 inline-flex items-center justify-center transition-colors"
                              title="Contactar al cliente"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: GESTIÓN DE DOMICILIARIOS */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface p-4 rounded-3xl border border-brand-border/70">
            <div>
              <h3 className="font-bold text-sm text-brand-cream">Equipo de Domiciliarios</h3>
              <p className="text-xs text-zinc-400">
                Registra, edita y gestiona los repartidores encargados de llevar los pedidos
              </p>
            </div>
            <button
              onClick={handleOpenCreateDriver}
              className="px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Domiciliario</span>
            </button>
          </div>

          {/* Grid de Domiciliarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDrivers.map((driver) => {
              const completedOrders = deliveryOrders.filter(
                (o) => o.driverId === driver.id && o.status === 'entregado'
              );
              const cashCollected = completedOrders
                .filter((o) => o.payments.some((p) => p.method === 'efectivo'))
                .reduce((sum, o) => sum + o.total, 0);

              return (
                <div
                  key={driver.id}
                  className={`p-5 rounded-3xl bg-brand-surface border transition-all space-y-4 shadow-sm ${
                    driver.active ? 'border-brand-border/80' : 'border-zinc-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                        driver.active
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <Bike className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-brand-cream">{driver.name}</h4>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          {driver.phone}
                        </span>
                        {driver.vehiclePlate && (
                          <span className="text-[11px] text-brand-orange font-semibold block mt-0.5">
                            🛵 {driver.vehiclePlate}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDriverActive(driver)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        driver.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title="Cambiar estado activo/inactivo"
                    >
                      {driver.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>

                  {/* Resumen de rendimiento */}
                  <div className="p-3 rounded-2xl bg-brand-surface-light border border-brand-border/50 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Entregas completadas:</span>
                      <span className="font-bold text-brand-cream">{completedOrders.length} pedidos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Efectivo recaudado:</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(cashCollected)}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 pt-2 border-t border-brand-border/60">
                    <a
                      href={`https://wa.me/57${driver.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(driver.name)},%20te%20escribimos%20de%20Chaves%20Burguer.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleOpenEditDriver(driver)}
                      className="p-2 rounded-xl bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-zinc-300 hover:text-white transition-colors"
                      title="Editar domiciliario"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: ZONAS Y TARIFAS */}
      {activeTab === 'zones' && (
        <div className="bg-brand-surface border border-brand-border/70 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-brand-cream">Zonas de Domicilio Configuradas</h3>
              <p className="text-xs text-zinc-400">Tarifa fija por sector y tiempo estimado de entrega</p>
            </div>
          </div>

          <div className="divide-y divide-brand-border/40">
            {settings.deliveryZones.map((z) => (
              <div key={z.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-sm text-brand-cream">{z.name}</h4>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-brand-orange" /> Tiempo estimado: ~{z.estimatedMinutes} minutos
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-sm text-brand-orange">
                    {formatCurrency(z.cost)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Activa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR DOMICILIARIO */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-brand-orange" />
                <h3 className="font-display text-lg font-black text-brand-cream">
                  {editingDriver ? 'Editar Domiciliario' : 'Registrar Nuevo Domiciliario'}
                </h3>
              </div>
              <button
                onClick={() => setDriverModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Brayan Sneider Ramos"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Celular / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 3209876543"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Vehículo / Placa (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Moto Boxer CT 100 - XRT 45E"
                  value={driverForm.vehiclePlate}
                  onChange={(e) => setDriverForm({ ...driverForm, vehiclePlate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="driverActive"
                  checked={driverForm.active}
                  onChange={(e) => setDriverForm({ ...driverForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-orange bg-brand-surface border-brand-border focus:ring-brand-orange"
                />
                <label htmlFor="driverActive" className="font-semibold text-zinc-300 cursor-pointer">
                  Domiciliario activo y disponible para despachos
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-brand-border/60">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white font-black rounded-xl text-xs hover:opacity-95 transition-all shadow-md"
                >
                  {editingDriver ? 'Guardar Cambios' : 'Registrar Domiciliario'}
                </button>
                <button
                  type="button"
                  onClick={() => setDriverModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
