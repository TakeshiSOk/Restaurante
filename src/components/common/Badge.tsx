import React from 'react';
import { OrderStatus, PaymentMethod, OrderOrigin } from '../../types';

interface BadgeProps {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  origin?: OrderOrigin;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const config: Record<OrderStatus, { text: string; bg: string; dot: string }> = {
    recibido: { text: 'Recibido', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400 animate-pulse' },
    en_cocina: { text: 'En Cocina', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400 animate-ping' },
    listo: { text: 'Listo para entrega', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    en_camino: { text: 'En Camino', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30', dot: 'bg-purple-400 animate-bounce' },
    entregado: { text: 'Entregado', bg: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/30', dot: 'bg-zinc-400' },
    cancelado: { text: 'Cancelado', bg: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
  };

  const item = config[status] || { text: status, bg: 'bg-zinc-700 text-zinc-300 border-zinc-600', dot: 'bg-zinc-400' };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${item.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.text}
    </span>
  );
};

export const OriginBadge: React.FC<{ origin: OrderOrigin }> = ({ origin }) => {
  const config: Record<OrderOrigin, { text: string; icon: string; bg: string }> = {
    web: { text: 'Web', icon: '🌐', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    mostrador: { text: 'Llevar', icon: '🛍️', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    mesa: { text: 'Mesa', icon: '🍽️', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    domicilio: { text: 'Domicilio', icon: '🛵', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    whatsapp: { text: 'WhatsApp', icon: '💬', bg: 'bg-green-500/15 text-green-400 border-green-500/30' },
  };

  const item = config[origin] || { text: origin, icon: '📦', bg: 'bg-zinc-700 text-zinc-300' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${item.bg}`}>
      <span>{item.icon}</span>
      <span>{item.text}</span>
    </span>
  );
};

export const PaymentMethodBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const config: Record<PaymentMethod, { text: string; bg: string }> = {
    efectivo: { text: 'Efectivo', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    nequi: { text: 'Nequi', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    daviplata: { text: 'Daviplata', bg: 'bg-red-500/15 text-red-300 border-red-500/30' },
    transferencia: { text: 'Transferencia', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    tarjeta: { text: 'Tarjeta', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    fiado: { text: 'Fiado / Crédito', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  };

  const item = config[method] || { text: method, bg: 'bg-zinc-700 text-zinc-300 border-zinc-600' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${item.bg}`}>
      {item.text}
    </span>
  );
};
