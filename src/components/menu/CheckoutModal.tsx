import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, generateWhatsAppOrderLink } from '../../lib/utils';
import { Order, OrderOrigin, PaymentMethod, DeliveryZone } from '../../types';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, MessageCircle, MapPin, DollarSign, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, settings, createOrder, clearCart } = useAppStore();

  const [orderType, setOrderType] = useState<OrderOrigin>('domicilio');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(
    settings.deliveryZones.find((z) => z.active) || null
  );
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Estados de post-confirmación
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, i) => acc + i.total, 0);
  const deliveryFee = orderType === 'domicilio' && selectedZone ? selectedZone.cost : 0;
  const total = subtotal + deliveryFee;

  // Cálculo de cambio para efectivo
  const cashAmountNum = parseFloat(cashGiven.replace(/\D/g, '')) || 0;
  const changeDue = Math.max(0, cashAmountNum - total);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 7) {
      setErrorMessage('Por favor ingresa un número de teléfono válido para contactarte.');
      return;
    }
    if (orderType === 'domicilio' && !address.trim()) {
      setErrorMessage('Por favor ingresa tu dirección de entrega.');
      return;
    }
    if (orderType === 'mesa' && !tableNumber.trim()) {
      setErrorMessage('Por favor especifica el número de mesa.');
      return;
    }
    if (paymentMethod === 'efectivo' && cashAmountNum > 0 && cashAmountNum < total) {
      setErrorMessage(`El monto con el que pagas (${formatCurrency(cashAmountNum)}) es menor al total (${formatCurrency(total)}).`);
      return;
    }

    setIsSubmitting(true);

    // Mapear items del carrito al modelo OrderItem
    const orderItems = cart.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: item.product.id,
      name: item.product.name,
      variantName: item.variantName,
      addons: item.addons,
      notes: item.notes,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total,
      readyInKitchen: false,
      station: (item.product.categoryId === 'pizzas'
        ? 'pizza'
        : item.product.categoryId.includes('salchipapa')
        ? 'freidora'
        : 'parrilla') as 'parrilla' | 'freidora' | 'pizza' | 'general',
    }));

    const newOrder = createOrder({
      origin: orderType,
      status: 'recibido',
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: orderType === 'domicilio' ? address.trim() : undefined,
        zoneName: orderType === 'domicilio' && selectedZone ? selectedZone.name : undefined,
        tableNumber: orderType === 'mesa' ? tableNumber.trim() : undefined,
      },
      items: orderItems,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      payments: [
        {
          method: paymentMethod,
          amount: total,
          receivedAmount: paymentMethod === 'efectivo' && cashAmountNum > 0 ? cashAmountNum : total,
          change: paymentMethod === 'efectivo' && cashAmountNum > 0 ? changeDue : 0,
        },
      ],
      notes: notes.trim() || undefined,
    });

    // Lanzar confetti discreto de celebración
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#B91C1C', '#F59E0B', '#FFF4E0'],
      });
    } catch {
      // ignore
    }

    clearCart();
    try {
      localStorage.setItem('chaves_last_order_code', newOrder.code);
      localStorage.setItem('chaves_last_order_phone', customerPhone.trim());
    } catch {
      // ignore
    }
    setConfirmedOrder(newOrder);
    setIsSubmitting(false);
  };

  const handleFinish = () => {
    onClose();
    if (confirmedOrder) {
      navigate(`/pedido/${confirmedOrder.code}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-xl w-full my-auto shadow-2xl overflow-hidden text-brand-cream animate-slide-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border/60 bg-brand-surface-light flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-wide">
            {confirmedOrder ? '¡Pedido Confirmado!' : 'Finalizar Pedido'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Pantalla de Éxito / Confirmación */
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
                Código de seguimiento
              </span>
              <h3 className="font-display text-4xl font-black text-brand-cream tracking-widest mt-0.5">
                {confirmedOrder.code}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
                Tu pedido ha sido recibido en el sistema de {settings.name} y ya está listo para pasar a cocina.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-brand-border/70 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Cliente:</span>
                <span className="font-semibold text-brand-cream">{confirmedOrder.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tipo:</span>
                <span className="font-semibold capitalize text-brand-cream">{confirmedOrder.origin}</span>
              </div>
              {confirmedOrder.customer.address && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Dirección:</span>
                  <span className="font-semibold text-brand-cream">{confirmedOrder.customer.address}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-brand-border text-sm">
                <span>Total:</span>
                <span className="text-brand-orange">{formatCurrency(confirmedOrder.total)}</span>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="space-y-2.5">
              <a
                href={generateWhatsAppOrderLink(confirmedOrder, settings.whatsappNumber, settings.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar comprobante por WhatsApp</span>
              </a>

              <button
                onClick={handleFinish}
                className="w-full py-3 px-4 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-brand-cream font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Seguir mi pedido en vivo</span>
                <ArrowRight className="w-4 h-4 text-brand-orange" />
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Checkout */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Selector de Tipo de Pedido */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                ¿Cómo deseas recibir tu pedido?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'domicilio' as OrderOrigin, label: 'Domicilio', icon: '🛵' },
                  { id: 'mostrador' as OrderOrigin, label: 'Para Llevar', icon: '🛍️' },
                  { id: 'mesa' as OrderOrigin, label: 'En Mesa', icon: '🍽️' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setOrderType(type.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      orderType === type.id
                        ? 'bg-brand-red/20 border-brand-red text-white shadow-sm'
                        : 'bg-brand-surface-light border-brand-border text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-xl block">{type.icon}</span>
                    <span className="text-xs font-bold block mt-1">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Datos Personales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Tu Nombre *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Andrés Morales"
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Teléfono Celular *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 310 123 4567"
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            {/* Dirección / Zona para Domicilio */}
            {orderType === 'domicilio' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-black/30 border border-brand-border/70">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Dirección de entrega *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, carrera, número, torre, apto..."
                    className="w-full p-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Zona de envío (Costo automático)
                  </label>
                  <select
                    value={selectedZone?.id}
                    onChange={(e) => {
                      const zone = settings.deliveryZones.find((z) => z.id === e.target.value);
                      if (zone) setSelectedZone(zone);
                    }}
                    className="w-full p-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm text-brand-cream focus:outline-none focus:border-brand-orange"
                  >
                    {settings.deliveryZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (+{formatCurrency(z.cost)}) ~ {z.estimatedMinutes} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Mesa # si es en mesa */}
            {orderType === 'mesa' && (
              <div className="space-y-1 p-3.5 rounded-2xl bg-black/30 border border-brand-border/70">
                <label className="text-xs font-semibold text-zinc-300">Número de Mesa *</label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ej: Mesa 4"
                  className="w-full p-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
                />
              </div>
            )}

            {/* Método de Pago */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                Método de pago
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'efectivo' as PaymentMethod, label: 'Efectivo', color: 'border-emerald-500/40' },
                  { id: 'nequi' as PaymentMethod, label: 'Nequi', color: 'border-purple-500/40' },
                  { id: 'daviplata' as PaymentMethod, label: 'Daviplata', color: 'border-red-500/40' },
                  { id: 'transferencia' as PaymentMethod, label: 'Bancolombia', color: 'border-blue-500/40' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-brand-orange/20 border-brand-orange text-white font-bold'
                        : 'bg-brand-surface-light border-brand-border text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-xs block">{pm.label}</span>
                  </button>
                ))}
              </div>

              {/* Si paga en efectivo, cálculo de cambio en vivo */}
              {paymentMethod === 'efectivo' && (
                <div className="mt-2 p-3 rounded-xl bg-black/30 border border-brand-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">¿Con cuánto billete pagas?</span>
                    <input
                      type="number"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      placeholder={`Ej: ${Math.ceil(total / 10000) * 10000}`}
                      className="w-32 p-1.5 rounded-lg bg-brand-surface border border-brand-border text-right text-brand-cream focus:outline-none focus:border-brand-orange font-bold text-xs"
                    />
                  </div>
                  {cashAmountNum >= total && (
                    <div className="flex justify-between items-center text-emerald-400 font-bold pt-1 border-t border-brand-border/40">
                      <span>Tu cambio será:</span>
                      <span>{formatCurrency(changeDue)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observaciones generales */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Observaciones para el pedido</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones adicionales para la entrega..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
              />
            </div>

            {/* Desglose de Totales */}
            <div className="p-4 rounded-2xl bg-black/40 border border-brand-border/70 text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({cart.length} productos):</span>
                <span className="text-brand-cream font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {orderType === 'domicilio' && (
                <div className="flex justify-between text-zinc-400">
                  <span>Costo de envío ({selectedZone?.name}):</span>
                  <span className="text-brand-cream font-medium">{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-brand-border/60 text-base font-black">
                <span className="text-brand-cream">Total a pagar:</span>
                <span className="text-brand-orange text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Botón de Enviar Pedido */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-black text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Procesando pedido...' : 'Confirmar Pedido Ahora'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
