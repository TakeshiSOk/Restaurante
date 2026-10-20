import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatTime, formatTimeAgo, playAlertSound } from '../../lib/utils';
import { StatusBadge, OriginBadge, PaymentMethodBadge } from '../../components/common/Badge';
import { ThermalReceipt } from '../../components/common/ThermalReceipt';
import {
  Search,
  Printer,
  XCircle,
  ArrowRight,
  Eye,
  Clock,
  Bike,
  Columns3,
  List,
  AlertCircle,
  X,
  CheckCircle,
  Check,
} from 'lucide-react';

export const OrdersKanbanPage: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder, assignDriver, staff, setNotification, currentUser } = useAppStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const deliveryStaff = staff.filter((s) => s.role === 'domiciliario' && s.active);

  // Filtrado y ordenamiento de pedidos (el más reciente siempre arriba)
  const filteredOrders = orders
    .filter((o) => {
      if (search.trim()) {
        const matchCode = o.code.toLowerCase().includes(search.toLowerCase());
        const matchCust = o.customer.name.toLowerCase().includes(search.toLowerCase());
        if (!matchCode && !matchCust) return false;
      }
      if (originFilter !== 'all' && o.origin !== originFilter) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );

  const kanbanColumns: { id: OrderStatus; label: string; color: string; desc: string }[] = [
    { id: 'recibido', label: 'Recibidos', color: 'border-blue-500/40 text-blue-400', desc: 'Nuevos pedidos' },
    { id: 'en_cocina', label: 'En Cocina', color: 'border-amber-500/40 text-amber-400', desc: 'Preparándose' },
    { id: 'listo', label: 'Listos', color: 'border-emerald-500/40 text-emerald-400', desc: 'Esperando despacho' },
    { id: 'en_camino', label: 'En Camino', color: 'border-purple-500/40 text-purple-400', desc: 'Domicilios en ruta' },
    { id: 'entregado', label: 'Entregados', color: 'border-zinc-600/40 text-zinc-400', desc: 'Finalizados hoy' },
  ];

  // Obtener pedidos por columna evitando sobrecargar el DOM con miles de órdenes antiguas
  const getOrdersForColumn = (status: OrderStatus) => {
    const list = filteredOrders.filter((o) => o.status === status);

    if (status === 'entregado') {
      const todayStr = new Date().toDateString();
      const todayDelivered = list.filter(
        (o) => new Date(o.updatedAt || o.createdAt).toDateString() === todayStr
      );
      // Mostrar los de hoy; si no hay hoy, mostrar máximo los 20 más recientes
      return todayDelivered.length > 0 ? todayDelivered.slice(0, 30) : list.slice(0, 20);
    }

    return list;
  };

  const handleNextStatus = (order: Order, targetStatus?: OrderStatus) => {
    let next: OrderStatus | null = targetStatus || null;
    if (!next) {
      if (order.status === 'recibido') {
        next = 'en_cocina';
      } else if (order.status === 'en_cocina') {
        next = 'listo';
      } else if (order.status === 'listo') {
        const isDelivery = order.origin === 'domicilio' || Boolean(order.customer?.address);
        next = isDelivery ? 'en_camino' : 'entregado';
      } else if (order.status === 'en_camino') {
        next = 'entregado';
      }
    }

    if (next) {
      updateOrderStatus(order.id, next);
      playAlertSound('kitchen');
      setNotification({
        message: `Pedido ${order.code} actualizado a: ${next.replace('_', ' ').toUpperCase()}`,
        type: 'success',
      });
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: next });
      }
    }
  };

  const handleCancelSubmit = () => {
    if (!cancelModalOrder) return;
    if (!cancelReason.trim()) {
      alert('Por favor especifica el motivo de la cancelación.');
      return;
    }
    cancelOrder(cancelModalOrder.id, cancelReason, currentUser?.name || 'Administrador');
    setCancelModalOrder(null);
    setCancelReason('');
    setNotification({
      message: `Pedido ${cancelModalOrder.code} cancelado (Stock reintegrado y auditoría registrada).`,
      type: 'warning',
    });
  };

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Control de Pedidos
          </h1>
          <p className="text-xs text-zinc-400">
            Flujo en tiempo real desde la recepción hasta la entrega al cliente
          </p>
        </div>

        {/* View mode toggle & search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar código o cliente..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange w-44 sm:w-56"
            />
          </div>

          {/* Origin filter */}
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="p-1.5 px-3 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
          >
            <option value="all">Todos los orígenes</option>
            <option value="web">Web</option>
            <option value="mostrador">Mostrador</option>
            <option value="mesa">Mesa</option>
            <option value="domicilio">Domicilio</option>
          </select>

          {/* Toggle Kanban / List */}
          <div className="flex items-center border border-brand-border rounded-xl bg-brand-surface p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-brand-red text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-brand-red text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const columnOrders = getOrdersForColumn(col.id);

            return (
              <div
                key={col.id}
                className="bg-brand-surface/90 border border-brand-border/70 rounded-3xl p-3 flex flex-col gap-2.5 min-h-[500px] shadow-sm"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-2xl border bg-brand-surface-light flex items-center justify-between ${col.color}`}>
                  <div className="font-bold text-xs">
                    <span>{col.label}</span>
                    <span className="text-[10px] text-zinc-400 block font-normal">{col.desc}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-xs font-black">
                    {col.id === 'entregado' && columnOrders.length > 0 ? `${columnOrders.length} hoy` : columnOrders.length}
                  </span>
                </div>

                {/* Orders in Column */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-17rem)]">
                  {columnOrders.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-[11px]">
                      Sin pedidos en este estado
                    </div>
                  ) : (
                    columnOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded-2xl bg-brand-surface-light border border-brand-border/80 hover:border-brand-orange/50 transition-all shadow-sm space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono font-black text-brand-orange text-sm block">
                              {order.code}
                            </span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatTime(order.createdAt)} ({formatTimeAgo(order.createdAt)})
                            </span>
                          </div>
                          <OriginBadge origin={order.origin} />
                        </div>

                        <div>
                          <div className="font-bold text-brand-cream">{order.customer.name}</div>
                          {order.customer.tableNumber && (
                            <span className="text-[10px] text-emerald-400 font-semibold block">
                              Mesa #{order.customer.tableNumber}
                            </span>
                          )}
                          {order.customer.address && (
                            <span className="text-[10px] text-zinc-400 line-clamp-1 block">
                              📍 {order.customer.address}
                            </span>
                          )}
                        </div>

                        {/* Items preview */}
                        <div className="py-1.5 border-t border-brand-border/40 text-[11px] text-zinc-300 space-y-0.5">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-bold text-zinc-400">{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] text-zinc-500 italic block">
                              +{order.items.length - 2} ítem(s) más...
                            </span>
                          )}
                        </div>

                        {/* Footer Total & Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
                          <span className="font-black text-brand-cream">{formatCurrency(order.total)}</span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1 rounded bg-brand-surface border border-brand-border text-zinc-400 hover:text-white"
                              title="Ver detalle"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePrint(order)}
                              className="p-1 rounded bg-brand-surface border border-brand-border text-zinc-400 hover:text-white"
                              title="Imprimir comanda"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Acciones claras de avance por estado */}
                            {order.status === 'recibido' && (
                              <button
                                onClick={() => handleNextStatus(order, 'en_cocina')}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-[10px] flex items-center gap-0.5 shadow-sm transition-all"
                                title="Enviar a cocina"
                              >
                                <span>A Cocina</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {order.status === 'en_cocina' && (
                              <button
                                onClick={() => handleNextStatus(order, 'listo')}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[10px] flex items-center gap-0.5 shadow-sm transition-all"
                                title="Marcar como listo"
                              >
                                <span>A Listos</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {order.status === 'listo' && (
                              <div className="flex items-center gap-1">
                                {(order.origin === 'domicilio' || Boolean(order.customer?.address)) ? (
                                  <>
                                    <button
                                      onClick={() => handleNextStatus(order, 'en_camino')}
                                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all"
                                      title="Despachar en ruta con domiciliario"
                                    >
                                      <Bike className="w-3 h-3" />
                                      <span>En Ruta</span>
                                    </button>
                                    <button
                                      onClick={() => handleNextStatus(order, 'entregado')}
                                      className="px-1.5 py-1 bg-zinc-700 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold rounded-lg text-[10px] transition-all"
                                      title="Entregar directo en local"
                                    >
                                      ✓
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleNextStatus(order, 'entregado')}
                                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all"
                                    title="Entregar al cliente"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Entregar</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {order.status === 'en_camino' && (
                              <button
                                onClick={() => handleNextStatus(order, 'entregado')}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all"
                                title="Marcar como entregado"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Entregar</span>
                              </button>
                            )}

                            {order.status === 'entregado' && (
                              <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 font-semibold">
                                <CheckCircle className="w-3 h-3 text-emerald-500/70" />
                                <span>Listo</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
                <tr>
                  <th className="p-3.5">CÓDIGO</th>
                  <th className="p-3.5">HORA</th>
                  <th className="p-3.5">ORIGEN</th>
                  <th className="p-3.5">CLIENTE</th>
                  <th className="p-3.5">ÍTEMS</th>
                  <th className="p-3.5">ESTADO</th>
                  <th className="p-3.5">PAGO</th>
                  <th className="p-3.5 text-right">TOTAL</th>
                  <th className="p-3.5 text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredOrders.slice(0, 30).map((order) => (
                  <tr key={order.id} className="hover:bg-brand-surface-light/50 transition-colors">
                    <td className="p-3.5 font-mono font-black text-brand-orange">{order.code}</td>
                    <td className="p-3.5 text-zinc-400 whitespace-nowrap">{formatTime(order.createdAt)}</td>
                    <td className="p-3.5">
                      <OriginBadge origin={order.origin} />
                    </td>
                    <td className="p-3.5 font-semibold text-brand-cream">{order.customer.name}</td>
                    <td className="p-3.5 text-zinc-400">{order.items.length} producto(s)</td>
                    <td className="p-3.5">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      {order.payments[0] ? (
                        <PaymentMethodBadge method={order.payments[0].method} />
                      ) : (
                        <span className="text-zinc-500">Pendiente</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-black text-brand-cream">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white"
                          title="Detalle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-1.5 rounded-lg bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white"
                          title="Imprimir"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {order.status !== 'entregado' && order.status !== 'cancelado' && (
                          <button
                            onClick={() => handleNextStatus(order)}
                            className="p-1.5 rounded-lg bg-brand-orange text-black font-bold hover:bg-brand-amber transition-all"
                            title="Avanzar estado"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-brand-cream space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <span className="font-mono text-xs text-zinc-400">Detalle del Pedido</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-display text-2xl font-black text-brand-orange">
                    {selectedOrder.code}
                  </h3>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Rápido de Estado en el Modal */}
            <div className="p-3 rounded-2xl bg-black/40 border border-brand-border/60 text-xs space-y-2">
              <span className="font-bold text-zinc-400 block text-[11px] uppercase tracking-wider">
                Cambiar Estado del Pedido
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'recibido' as const, label: 'Recibido' },
                  { id: 'en_cocina' as const, label: 'En Cocina' },
                  { id: 'listo' as const, label: 'Listo' },
                  { id: 'en_camino' as const, label: 'En Camino' },
                  { id: 'entregado' as const, label: 'Entregado' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleNextStatus(selectedOrder, s.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      selectedOrder.status === s.id
                        ? 'bg-brand-orange text-black border-brand-orange font-black shadow-md'
                        : 'bg-brand-surface border-brand-border text-zinc-400 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Cliente */}
            <div className="p-3 rounded-2xl bg-black/40 border border-brand-border/60 text-xs space-y-1">
              <div><span className="text-zinc-400">Cliente:</span> <span className="font-bold">{selectedOrder.customer.name}</span></div>
              <div><span className="text-zinc-400">Teléfono:</span> {selectedOrder.customer.phone}</div>
              {selectedOrder.customer.address && <div><span className="text-zinc-400">Dirección:</span> {selectedOrder.customer.address}</div>}
              {selectedOrder.customer.tableNumber && <div><span className="text-zinc-400">Mesa:</span> #{selectedOrder.customer.tableNumber}</div>}
            </div>

            {/* Asignación Domiciliario si es domicilio */}
            {(selectedOrder.origin === 'domicilio' || Boolean(selectedOrder.customer.address)) && (
              <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Bike className="w-4 h-4" />
                  <span>Domiciliario Asignado:</span>
                </div>
                <select
                  value={selectedOrder.driverId || ''}
                  onChange={(e) => {
                    const drv = deliveryStaff.find((s) => s.id === e.target.value);
                    if (drv) assignDriver(selectedOrder.id, drv.id, drv.name);
                  }}
                  className="w-full p-2 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream focus:outline-none"
                >
                  <option value="">Sin asignar aún</option>
                  {deliveryStaff.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ítems */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-orange uppercase block">Platos</span>
              <div className="divide-y divide-brand-border/40 text-xs">
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <div className="font-bold">{i.quantity}x {i.name}</div>
                      {i.variantName && <div className="text-[11px] text-brand-orange">{i.variantName}</div>}
                      {i.addons && i.addons.length > 0 && (
                        <div className="text-[10px] text-zinc-400">+ {i.addons.map((a) => a.name).join(', ')}</div>
                      )}
                      {i.notes && <div className="text-[10px] text-amber-300 italic">Nota: {i.notes}</div>}
                    </div>
                    <span className="font-bold">{formatCurrency(i.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Línea de tiempo de estados */}
            <div className="space-y-1.5 pt-2 border-t border-brand-border/60">
              <span className="text-xs font-bold text-zinc-400 block">Línea de tiempo</span>
              <div className="space-y-1 text-[11px] text-zinc-400">
                {selectedOrder.timeline.map((t, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="capitalize font-medium text-zinc-300">{t.status.replace('_', ' ')}:</span>
                    <span>{formatTime(t.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción modal */}
            <div className="pt-3 border-t border-brand-border/60 flex flex-wrap gap-2">
              <button
                onClick={() => handlePrint(selectedOrder)}
                className="flex-1 py-2.5 px-3 bg-brand-surface-light border border-brand-border hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Reimprimir Comanda</span>
              </button>

              {selectedOrder.status !== 'cancelado' && (
                <button
                  onClick={() => {
                    setCancelModalOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="py-2.5 px-3 bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/40 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar Pedido</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR PEDIDO */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-red-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-brand-cream">
            <h3 className="font-bold text-base text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Cancelar Pedido {cancelModalOrder.code}</span>
            </h3>

            <p className="text-xs text-zinc-300">
              Por favor ingresa el motivo obligatorio de cancelación para la auditoría:
            </p>

            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ej: El cliente canceló por demora / Error en digitación..."
              className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-red-400"
            />

            <div className="flex gap-2">
              <button
                onClick={handleCancelSubmit}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirmar Cancelación
              </button>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Thermal Receipt for Print */}
      {printOrder && (
        <div className="hidden print:block">
          <ThermalReceipt order={printOrder} />
        </div>
      )}
    </div>
  );
};
