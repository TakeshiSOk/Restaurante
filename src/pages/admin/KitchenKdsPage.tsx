import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Order } from '../../types';
import { formatTime, playAlertSound } from '../../lib/utils';
import { OriginBadge } from '../../components/common/Badge';
import { ChefHat, Check, Clock, Flame, Filter, Volume2 } from 'lucide-react';
import { differenceInMinutes, parseISO } from 'date-fns';

export const KitchenKdsPage: React.FC = () => {
  const { orders, updateOrderStatus, toggleItemReady, setNotification } = useAppStore();

  const [stationFilter, setStationFilter] = useState<'all' | 'parrilla' | 'freidora' | 'pizza'>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Actualizar temporizador cada 10 segundos
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filtrar pedidos que están en preparación ('recibido' o 'en_cocina')
  const kitchenOrders = orders.filter(
    (o) => o.status === 'en_cocina' || o.status === 'recibido'
  );

  const handleItemToggle = (orderId: string, itemId: string) => {
    toggleItemReady(orderId, itemId);
  };

  const handleOrderReady = (order: Order) => {
    updateOrderStatus(order.id, 'listo');
    playAlertSound('kitchen');
    setNotification({
      message: `¡Comanda ${order.code} marcada como LISTA para entrega!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* KDS Header & Station Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface p-4 rounded-3xl border border-brand-border/70">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-red/20 text-brand-red-light border border-brand-red/40">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-brand-cream tracking-wide">
              KDS Cocina & Parrilla
            </h1>
            <p className="text-xs text-zinc-400">
              Comandas en preparación ({kitchenOrders.length} activas)
            </p>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-brand-border">
          {[
            { id: 'all' as const, label: 'Todas las áreas' },
            { id: 'parrilla' as const, label: '🔥 Parrilla / Asados' },
            { id: 'freidora' as const, label: '🍟 Freidora / Salchipapas' },
            { id: 'pizza' as const, label: '🍕 Horno Pizzas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStationFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stationFilter === tab.id
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KDS Big Ticket Cards Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-brand-surface border border-brand-border/60 rounded-3xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-xl font-black text-brand-cream">¡Cocina al día!</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            No hay comandas pendientes por preparar en este momento. Los nuevos pedidos aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kitchenOrders.map((order) => {
            const minutesElapsed = differenceInMinutes(currentTime, parseISO(order.createdAt));

            // Semáforo de tiempo
            let timerBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
            if (minutesElapsed >= 25) {
              timerBadge = 'bg-red-500/30 text-red-300 border-red-500 animate-pulse';
            } else if (minutesElapsed >= 15) {
              timerBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            }

            // Filtrar ítems de la comanda según la estación seleccionada
            const visibleItems = order.items.filter((item) => {
              if (stationFilter === 'all') return true;
              return item.station === stationFilter;
            });

            if (visibleItems.length === 0) return null;

            const allItemsReady = order.items.every((i) => i.readyInKitchen);

            return (
              <div
                key={order.id}
                className="bg-brand-surface border-2 border-brand-border/80 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Header Comanda */}
                <div className="p-4 bg-brand-surface-light border-b border-brand-border/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-2xl text-brand-orange">
                        {order.code}
                      </span>
                      <OriginBadge origin={order.origin} />
                    </div>
                    <span className="text-xs text-brand-cream font-bold block mt-0.5">
                      {order.customer.tableNumber ? `MESA #${order.customer.tableNumber}` : order.customer.name}
                    </span>
                  </div>

                  {/* Timer Semáforo */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black ${timerBadge}`}>
                    <Clock className="w-4 h-4" />
                    <span>{minutesElapsed} min</span>
                  </div>
                </div>

                {/* Items List (Touchable strike-through) */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemToggle(order.id, item.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        item.readyInKitchen
                          ? 'bg-black/40 border-zinc-700/60 opacity-50 line-through'
                          : 'bg-brand-surface-light border-brand-border hover:border-brand-orange/60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          item.readyInKitchen
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : 'border-zinc-500 bg-brand-surface'
                        }`}
                      >
                        {item.readyInKitchen && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div className="font-black text-base text-brand-cream">
                          {item.quantity}x {item.name}
                        </div>
                        {item.variantName && (
                          <div className="text-xs font-bold text-brand-orange">
                            Opción: {item.variantName}
                          </div>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-xs text-amber-300 font-medium">
                            ➕ {item.addons.map((a) => a.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-xs text-red-300 font-bold bg-red-950/40 px-2 py-0.5 rounded mt-1 inline-block">
                            ⚠️ NOTA: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                      <span className="font-bold">Observación general:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Footer KDS Button */}
                <div className="p-4 bg-brand-surface-light border-t border-brand-border/60">
                  <button
                    onClick={() => handleOrderReady(order)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md ${
                      allItemsReady
                        ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>MARCAR COMANDA LISTA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
