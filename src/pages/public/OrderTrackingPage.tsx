import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { BrandLogo } from '../../components/common/BrandLogo';
import { StatusBadge } from '../../components/common/Badge';
import { ProductImage } from '../../components/common/ProductImage';
import { CheckCircle2, Clock, ChefHat, Bike, PackageCheck, ArrowLeft, MessageCircle } from 'lucide-react';
import { OrderStatus } from '../../types';

export const OrderTrackingPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { orders, settings } = useAppStore();

  const order = orders.find((o) => o.code.toUpperCase() === (code || '').toUpperCase());

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-2xl p-6 text-center space-y-4">
          <BrandLogo size="md" className="justify-center" />
          <h2 className="text-xl font-bold text-brand-red">Pedido no encontrado</h2>
          <p className="text-xs text-zinc-400">
            No encontramos ningún pedido registrado con el código <span className="font-mono text-white font-bold">{code}</span>.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Menú Principal</span>
          </Link>
        </div>
      </div>
    );
  }

  // Definición de etapas según origen
  const isDelivery = order.origin === 'domicilio';
  const steps: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'recibido', label: 'Recibido', icon: <Clock className="w-4 h-4" />, desc: 'Tu pedido ingresó a nuestro sistema' },
    { key: 'en_cocina', label: 'En Cocina', icon: <ChefHat className="w-4 h-4" />, desc: 'Nuestros cocineros están preparando tu comida' },
    { key: 'listo', label: 'Listo', icon: <PackageCheck className="w-4 h-4" />, desc: 'Empacado y listo para entregar' },
    ...(isDelivery
      ? [{ key: 'en_camino' as OrderStatus, label: 'En Camino', icon: <Bike className="w-4 h-4" />, desc: `Llevado por ${order.driverName || 'el domiciliario'}` }]
      : []),
    { key: 'entregado', label: 'Entregado', icon: <CheckCircle2 className="w-4 h-4" />, desc: '¡Buen provecho! Gracias por preferirnos' },
  ];

  const statusOrderIndex: Record<OrderStatus, number> = {
    recibido: 0,
    en_cocina: 1,
    listo: 2,
    en_camino: isDelivery ? 3 : 2,
    entregado: isDelivery ? 4 : 3,
    cancelado: -1,
  };

  const currentStepIdx = statusOrderIndex[order.status];

  return (
    <div className="min-h-screen bg-[#0C0A09] text-brand-cream pb-12">
      {/* Header */}
      <header className="bg-brand-surface border-b border-brand-border/60 p-4 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-brand-orange transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Ver Menú</span>
          </Link>
          <BrandLogo size="sm" showTagline={false} />
          <span className="font-mono text-xs font-bold text-brand-orange bg-brand-surface-light px-2.5 py-1 rounded-lg border border-brand-border">
            {order.code}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Main Status Hero Card */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/60">
            <div>
              <span className="text-xs text-zinc-400">Estado en vivo del pedido</span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="font-display text-3xl font-black text-brand-cream">
                  {order.code}
                </h1>
                <StatusBadge status={order.status} size="md" />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Realizado el {formatDateTime(order.createdAt)}
              </p>
            </div>

            {/* WhatsApp Contact button */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hola,%20quisiera%20consultar%20sobre%20mi%20pedido%20${order.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold rounded-xl text-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Preguntar por WhatsApp</span>
            </a>
          </div>

          {/* Cancelled Alert if applicable */}
          {order.status === 'cancelado' ? (
            <div className="mt-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs">
              <h4 className="font-bold text-sm">Pedido Cancelado</h4>
              <p className="mt-1">Motivo: {order.cancelReason || 'Cancelado por el establecimiento o a petición del cliente.'}</p>
            </div>
          ) : (
            /* Timeline Progress Bar */
            <div className="mt-8 space-y-6">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 h-1 bg-brand-surface-light -translate-y-1/2 z-0" />
                <div
                  className="absolute top-4 left-4 sm:left-6 h-1 bg-gradient-to-r from-brand-red via-brand-orange to-emerald-400 -translate-y-1/2 z-0 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIdx / (steps.length - 1)) * 100))}%`,
                  }}
                />

                {/* Nodes */}
                <div className="relative z-10 flex justify-between">
                  {steps.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isCurrent
                              ? 'bg-brand-orange border-white text-black scale-110 shadow-glow-amber animate-pulse'
                              : isPassed
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'bg-brand-surface border-brand-border text-zinc-500'
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`mt-2 text-[11px] font-bold text-center ${
                            isCurrent ? 'text-brand-orange' : isPassed ? 'text-brand-cream' : 'text-zinc-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current status description box */}
              {currentStepIdx >= 0 && (
                <div className="p-4 rounded-2xl bg-black/40 border border-brand-border/60 text-center">
                  <p className="text-xs text-brand-cream/90 font-medium">
                    {steps[currentStepIdx]?.desc}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Details & Summary Card */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/80 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-brand-cream border-b border-brand-border/60 pb-3">
            Detalle del Pedido
          </h3>

          <div className="divide-y divide-brand-border/40">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-start gap-3 text-xs">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-brand-border/80 shadow-sm bg-zinc-950">
                    <ProductImage
                      product={{ categoryId: 'burgers', name: item.name }}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-brand-cream text-sm">
                      {item.quantity}x {item.name}
                    </div>
                    {item.variantName && (
                      <div className="text-brand-orange font-medium">Opción: {item.variantName}</div>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <div className="text-zinc-400">
                        Adiciones: {item.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.notes && <div className="text-amber-300/80 italic">Nota: {item.notes}</div>}
                  </div>
                </div>
                <span className="font-bold text-sm text-brand-cream whitespace-nowrap">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-brand-border/70 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="text-brand-cream font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Costo de domicilio:</span>
                <span className="text-brand-cream font-medium">{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-brand-border/60 font-black text-sm">
              <span className="text-brand-cream">Total:</span>
              <span className="text-brand-orange text-base">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
