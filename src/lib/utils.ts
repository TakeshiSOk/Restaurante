import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order, PaymentMethod } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateador de moneda colombiana oficial sin decimales ($28.000 COP)
const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Consultar precio';
  }
  return copFormatter.format(Math.round(amount));
}

export function formatDateTime(isoString: string): string {
  try {
    return format(parseISO(isoString), "d 'de' MMMM, h:mm a", { locale: es });
  } catch {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy', { locale: es });
  } catch {
    return isoString;
  }
}

export function formatTime(isoString: string): string {
  try {
    return format(parseISO(isoString), 'h:mm a', { locale: es });
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

/**
 * Cálculo exacto de cambio / vueltas para pagos en efectivo.
 * Garantiza enteros positivos sin errores de coma flotante.
 */
export function calculateChange(receivedAmount: number, totalAmount: number): number {
  if (receivedAmount <= totalAmount) return 0;
  return Math.round(receivedAmount - totalAmount);
}

/**
 * Validador estricto de pagos (soporta pagos simples y pagos mixtos).
 * Comprueba que la suma de todos los medios cubra exactamente o supere (en caso de efectivo) el total.
 */
export function validateOrderPayments(
  payments: { method: PaymentMethod; amount: number; receivedAmount?: number }[],
  total: number
): { valid: boolean; isValid: boolean; totalPaid: number; difference: number; errorMessage?: string; error?: string } {
  if (!payments || payments.length === 0) {
    const msg = 'Debe especificar al menos un método de pago.';
    return { valid: false, isValid: false, totalPaid: 0, difference: total, errorMessage: msg, error: msg };
  }

  const totalApplied = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const diff = total - totalApplied;

  if (diff > 0) {
    const msg = `El pago acumulado (${formatCurrency(totalApplied)}) no cubre el total de la orden (${formatCurrency(total)}). Faltan ${formatCurrency(diff)}.`;
    return {
      valid: false,
      isValid: false,
      totalPaid: totalApplied,
      difference: diff,
      errorMessage: msg,
      error: msg,
    };
  }

  if (diff < 0) {
    const msg = `El pago acumulado (${formatCurrency(totalApplied)}) supera el total de la orden (${formatCurrency(total)}).`;
    return {
      valid: false,
      isValid: false,
      totalPaid: totalApplied,
      difference: diff,
      errorMessage: msg,
      error: msg,
    };
  }

  // Si hay efectivo, verificar que receivedAmount >= amount
  for (const p of payments) {
    if (p.method === 'efectivo' && p.receivedAmount && p.receivedAmount < p.amount) {
      const msg = `El efectivo recibido (${formatCurrency(p.receivedAmount)}) es menor que el importe asignado a efectivo (${formatCurrency(p.amount)}).`;
      return {
        valid: false,
        isValid: false,
        totalPaid: totalApplied,
        difference: diff,
        errorMessage: msg,
        error: msg,
      };
    }
  }

  return { valid: true, isValid: true, totalPaid: totalApplied, difference: 0 };
}

/**
 * Sanitización estricta de celdas para exportación CSV (Prevención de CWE-1236 Formula Injection).
 * Si el campo inicia con caracteres de fórmula (=, +, -, @), se antepone comilla simple.
 * Se escapan comillas dobles y saltos de línea.
 */
export function sanitizeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();

  // Prevención de inyección de fórmulas en Excel / LibreOffice
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escapar comillas dobles internas
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Obtiene la imagen apetitosa de alta resolución adecuada para un producto.
 * Asegura que ninguna tarjeta muestre el falso fondo cuadriculado ni quede vacía.
 */
export function getProductImage(product: { categoryId: string; image?: string; name?: string }): string {
  if (product.image && !product.image.includes('burger-sample.png') && product.image.startsWith('/images/')) {
    return product.image;
  }
  const nameLower = (product.name || '').toLowerCase();
  const cat = product.categoryId;

  // 1. Hamburguesas
  if (cat === 'burgers') {
    if (nameLower.includes('hawai') || nameLower.includes('especial') || nameLower.includes('empoderada')) return '/images/burger-especial.jpg';
    if (nameLower.includes('bacon') || nameLower.includes('ranchera') || nameLower.includes('power')) return '/images/burger-bacon.jpg';
    if (nameLower.includes('doble') || nameLower.includes('golosa') || nameLower.includes('mixta') || nameLower.includes('combi') || nameLower.includes('tex-mex') || nameLower.includes('love')) return '/images/burger-double.jpg';
    return '/images/burger-classic.jpg';
  }

  // 2. Salchipapas Grandes
  if (cat === 'salchipapas-grandes') {
    if (nameLower.includes('mega') || nameLower.includes('pecadora') || nameLower.includes('trifásica')) return '/images/salchipapa-grande.jpg';
    return '/images/salchipapa-especial.jpg';
  }

  // 3. Salchipapas Compartir / Bandejas
  if (cat === 'salchipapas-compartir') {
    return '/images/bandeja-compartir.jpg';
  }

  // 4. Salchipapas Jr / Pequeñas
  if (cat === 'salchipapas-pequenas') {
    if (nameLower.includes('chori') || nameLower.includes('salchicarne')) return '/images/salchipapa-especial.jpg';
    return '/images/salchipapa-jr.jpg';
  }

  // 5. Pizzas
  if (cat === 'pizzas') {
    if (nameLower.includes('pepperoni') || nameLower.includes('ranchera') || nameLower.includes('picante')) return '/images/pizza-pepperoni.jpg';
    if (nameLower.includes('frutal') || nameLower.includes('candy') || nameLower.includes('porcion') || nameLower.includes('slice')) return '/images/pizza-slice.jpg';
    return '/images/pizza-artesanal.jpg';
  }

  // 6. Asados & Picadas
  if (cat === 'asados') {
    if (nameLower.includes('alita')) return '/images/alitas.jpg';
    if (nameLower.includes('picada') || nameLower.includes('familiar')) return '/images/picada-criolla.jpg';
    if (nameLower.includes('churrasco') || nameLower.includes('pechuga') || nameLower.includes('filete')) return '/images/churrasco-carne.jpg';
    return '/images/asado-carbon.jpg';
  }

  // 7. Patacones
  if (cat === 'patacones') {
    return '/images/patacon.jpg';
  }

  // 8. Sándwiches Cubanos
  if (cat === 'sandwiches') {
    if (nameLower.includes('pollo')) return '/images/sandwich-pollo.jpg';
    return '/images/sandwich-cubano.jpg';
  }

  // 9. Hot Dogs & Perradas
  if (cat === 'hotdogs') {
    if (nameLower.includes('especial') || nameLower.includes('perrada') || nameLower.includes('bacano') || nameLower.includes('montañero')) return '/images/perro-especial.jpg';
    return '/images/hotdog.jpg';
  }

  // 10. Puntas
  if (cat === 'puntas') {
    return '/images/puntas.jpg';
  }

  // 11. Adiciones & Acompañamientos
  if (cat === 'adiciones') {
    if (nameLower.includes('papa') || nameLower.includes('retacadas')) return '/images/papas-francesas.jpg';
    return '/images/adiciones.jpg';
  }

  // 12. Bebidas
  if (cat === 'bebidas') {
    if (nameLower.includes('jugo')) return '/images/jugos-naturales.jpg';
    if (nameLower.includes('limonada')) return '/images/limonada-natural.jpg';
    return '/images/bebidas-frias.jpg';
  }

  return '/images/burger-classic.jpg';
}

// Genera un beep con Web Audio API para alertas de pedidos sin requerir archivos mp3
export function playAlertSound(type: 'order' | 'kitchen' | 'success' = 'order') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'order') {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.2);
          gain2.gain.setValueAtTime(0.3, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.4);
        } catch {
          // ignore
        }
      }, 160);
    } else if (type === 'kitchen') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Audio no disponible o bloqueado por el navegador:', e);
  }
}

// Generador de mensaje formateado con emojis para WhatsApp
export function generateWhatsAppOrderLink(
  order: Order,
  whatsappNumber: string,
  businessName = 'Chaves Burguer'
): string {
  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  const itemsText = order.items
    .map((item, idx) => {
      let line = `${idx + 1}. *${item.quantity}x ${item.name}*`;
      if (item.variantName) line += ` (${item.variantName})`;
      line += ` - ${formatCurrency(item.total)}`;
      if (item.addons && item.addons.length > 0) {
        line += `\n   ➕ _${item.addons.map((a) => `${a.name} (+${formatCurrency(a.price)})`).join(', ')}_`;
      }
      if (item.notes) {
        line += `\n   📝 _Nota: ${item.notes}_`;
      }
      return line;
    })
    .join('\n\n');

  const originLabel: Record<string, string> = {
    domicilio: '🛵 Domicilio',
    mostrador: '🛍️ Para Llevar (Mostrador)',
    mesa: `🍽️ En Mesa #${order.customer.tableNumber || 'S/N'}`,
    web: '🌐 Pedido Web',
    whatsapp: '💬 WhatsApp',
  };

  const paymentLabel: Record<string, string> = {
    efectivo: '💵 Efectivo',
    nequi: '🟣 Nequi',
    daviplata: '🔴 Daviplata',
    transferencia: '🏦 Transferencia',
    tarjeta: '💳 Tarjeta',
    fiado: '📑 Fiado / Cuenta',
  };

  const mainPayment = order.payments[0];
  let paymentText = mainPayment ? paymentLabel[mainPayment.method] || mainPayment.method : 'Por acordar';
  if (mainPayment && mainPayment.method === 'efectivo' && mainPayment.receivedAmount) {
    paymentText += ` (Paga con: ${formatCurrency(mainPayment.receivedAmount)} - Cambio: ${formatCurrency(mainPayment.change ?? 0)})`;
  }

  let text = `🍔 *NUEVO PEDIDO - ${businessName.toUpperCase()}*\n`;
  text += `Código: *${order.code}*\n`;
  text += `Tipo: ${originLabel[order.origin] || order.origin}\n\n`;
  text += `👤 *Cliente:* ${order.customer.name}\n`;
  text += `📞 *Teléfono:* ${order.customer.phone}\n`;

  if (order.customer.address) {
    text += `📍 *Dirección:* ${order.customer.address}`;
    if (order.customer.zoneName) text += ` (${order.customer.zoneName})`;
    text += `\n`;
  }

  text += `\n📋 *DETALLE DEL PEDIDO:*\n${itemsText}\n\n`;
  text += `💰 *Subtotal:* ${formatCurrency(order.subtotal)}\n`;
  if (order.discount > 0) text += `🏷️ *Descuento:* -${formatCurrency(order.discount)}\n`;
  if (order.deliveryFee > 0) text += `🛵 *Domicilio:* ${formatCurrency(order.deliveryFee)}\n`;
  if (order.tip && order.tip > 0) text += `✨ *Propina:* ${formatCurrency(order.tip)}\n`;
  text += `🔥 *TOTAL A PAGAR: ${formatCurrency(order.total)}*\n\n`;
  text += `💳 *Método de pago:* ${paymentText}\n`;
  if (order.notes) text += `📝 *Observaciones:* ${order.notes}\n`;

  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/pedido/${order.code}` : '';
  if (trackingUrl) {
    text += `\n📍 *Seguimiento en vivo:* ${trackingUrl}\n`;
  }
  text += `\n¡Gracias por elegir a *${businessName}!* 🙌`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
