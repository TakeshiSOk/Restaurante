import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatTime } from '../../lib/utils';
import { StatusBadge } from '../../components/common/Badge';
import {
  Bike,
  MapPin,
  Clock,
  User,
  Phone,
  MessageCircle,
  Plus,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export const DeliveryManagementPage: React.FC = () => {
  const { orders, settings, updateSettings, staff, assignDriver, updateOrderStatus, setNotification, currentUser } =
    useAppStore();

  const isDriver = currentUser?.role === 'domiciliario';
  const [activeTab, setActiveTab] = useState<'deliveries' | 'zones'>('deliveries');

  const deliveryDrivers = staff.filter((s) => s.role === 'domiciliario' && s.active);

  // Pedidos con origen domicilio
  const deliveryOrders = orders.filter((o) => o.origin === 'domicilio');
  const activeDeliveries = deliveryOrders.filter((o) => {
    const isPending = o.status === 'en_cocina' || o.status === 'listo' || o.status === 'en_camino';
    if (!isPending) return false;
    if (isDriver) {
      return o.driverId === currentUser?.id;
    }
    return true;
  });

  // Estadísticas por domiciliario
  const driverStats = deliveryDrivers.map((driver) => {
    const driverOrders = deliveryOrders.filter((o) => o.driverId === driver.id && o.status === 'entregado');
    const totalCollected = driverOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      driver,
      completedCount: driverOrders.length,
      totalCollected,
    };
  });

  const handleAdvanceDelivery = (orderId: string, currentStatus: string) => {
    if (currentStatus === 'listo') {
      updateOrderStatus(orderId, 'en_camino');
      setNotification({ message: 'Pedido despachado En Camino con el domiciliario.', type: 'info' });
    } else if (currentStatus === 'en_camino') {
      updateOrderStatus(orderId, 'entregado');
      setNotification({ message: 'Domicilio entregado exitosamente al cliente.', type: 'success' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Despacho & Domicilios
          </h1>
          <p className="text-xs text-zinc-400">
            Asignación de repartidores, tiempos estimados de entrega y tarifas por zona
          </p>
        </div>

        {!isDriver && (
          <div className="flex items-center gap-1.5 p-1 bg-brand-surface rounded-2xl border border-brand-border">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'deliveries'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Domicilios en Curso ({activeDeliveries.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'zones'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Zonas & Tarifas ({settings.deliveryZones.length})</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'deliveries' ? (
        <div className="space-y-6">
          {/* Driver Metric Cards (Solo visible para administración) */}
          {!isDriver && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {driverStats.map((ds) => (
                <div
                  key={ds.driver.id}
                  className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-brand-cream">{ds.driver.name}</h4>
                        <span className="text-[10px] text-zinc-400">Tel: {ds.driver.phone}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Activo
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-brand-border/50 text-xs">
                    <span className="text-zinc-400">Entregas completadas:</span>
                    <span className="font-bold text-brand-cream">{ds.completedCount} pedidos</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Deliveries List */}
          <div className="bg-brand-surface border border-brand-border/70 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="font-bold text-sm text-brand-cream">Pedidos a Domicilio en Curso</h3>
              <span className="text-xs text-zinc-400">{activeDeliveries.length} activos</span>
            </div>

            {activeDeliveries.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No hay pedidos a domicilio pendientes en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {activeDeliveries.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-brand-surface-light border border-brand-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-brand-orange text-sm">
                          {order.code}
                        </span>
                        <StatusBadge status={order.status} size="sm" />
                        <span className="text-zinc-400">{formatTime(order.createdAt)}</span>
                      </div>
                      <div className="font-bold text-sm text-brand-cream">{order.customer.name}</div>
                      <div className="text-zinc-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-red-light" />
                        <span>{order.customer.address || 'Sin dirección especificada'}</span>
                        {order.customer.zoneName && (
                          <span className="text-brand-orange font-semibold">({order.customer.zoneName})</span>
                        )}
                      </div>
                      {order.notes && (
                        <div className="text-[11px] text-amber-300 italic">Nota: {order.notes}</div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Total a Cobrar:</span>
                        <span className="font-black text-base text-brand-cream">
                          {formatCurrency(order.total)}
                        </span>
                      </div>

                      {/* Driver select */}
                      <select
                        value={order.driverId || ''}
                        onChange={(e) => {
                          const driver = deliveryDrivers.find((d) => d.id === e.target.value);
                          if (driver) assignDriver(order.id, driver.id, driver.name);
                        }}
                        className="p-2 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream focus:outline-none"
                      >
                        <option value="">Seleccionar Domiciliario</option>
                        {deliveryDrivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>

                      {/* Advance Button */}
                      {order.status === 'listo' && (
                        <button
                          onClick={() => handleAdvanceDelivery(order.id, order.status)}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Despachar (En Camino)
                        </button>
                      )}
                      {order.status === 'en_camino' && (
                        <button
                          onClick={() => handleAdvanceDelivery(order.id, order.status)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Marcar Entregado
                        </button>
                      )}

                      {/* WhatsApp to customer */}
                      <a
                        href={`https://wa.me/57${order.customer.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customer.name)},%20tu%20pedido%20${order.code}%20de%20Chaves%20Burguer%20va%20en%20camino.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 transition-colors"
                        title="Escribir por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ZONAS Y TARIFAS */
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
    </div>
  );
};
