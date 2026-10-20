import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Product, OrderOrigin, PaymentMethod, Variant, AddonItem, OrderPayment } from '../../types';
import { formatCurrency, playAlertSound, calculateChange, validateOrderPayments } from '../../lib/utils';
import { ThermalReceipt } from '../../components/common/ThermalReceipt';
import { ProductImage } from '../../components/common/ProductImage';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  CreditCard,
  Banknote,
  DollarSign,
  User,
  Utensils,
  X,
  Percent,
} from 'lucide-react';

interface PosCartItem {
  id: string;
  product: Product;
  variantName?: string;
  addons: AddonItem[];
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export const PosPage: React.FC = () => {
  const { categories, products, customers, tables, createOrder, updateTableStatus, setNotification, currentUser } =
    useAppStore();

  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || 'burgers');
  const [search, setSearch] = useState('');

  // Carrito de POS
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [orderOrigin, setOrderOrigin] = useState<OrderOrigin>(tableParam ? 'mesa' : 'mostrador');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>(tableParam || '1');

  useEffect(() => {
    if (tableParam) {
      setOrderOrigin('mesa');
      setSelectedTable(tableParam);
    }
  }, [tableParam]);

  // Descuento y propina
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Modal de opciones rápidas para producto
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([]);
  const [itemNotes, setItemNotes] = useState('');

  // Modal de Cobro
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isMixedPayment, setIsMixedPayment] = useState(false);
  const [mixedPart1Method, setMixedPart1Method] = useState<PaymentMethod>('efectivo');
  const [mixedPart1Amount, setMixedPart1Amount] = useState<string>('');
  const [mixedPart2Method, setMixedPart2Method] = useState<PaymentMethod>('nequi');
  const [mixedPart2Amount, setMixedPart2Amount] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null);

  // Totales
  const subtotal = posCart.reduce((acc, i) => acc + i.total, 0);
  const calculatedDiscount =
    discountType === 'percent' ? Math.round((subtotal * discountValue) / 100) : discountValue;
  const total = Math.max(0, subtotal - calculatedDiscount + tipAmount);

  // Cambio
  const cashNum = parseFloat(cashReceived.replace(/\D/g, '')) || 0;
  const changeDue = Math.max(0, cashNum - total);

  // Filtrado de productos en POS
  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return p.categoryId === activeCategory;
  });

  const handleProductClick = (prod: Product) => {
    if (!prod.available) return;

    // Si tiene variantes o grupos de adiciones, abrir modal rápido
    if ((prod.variants && prod.variants.length > 0) || (prod.addonGroups && prod.addonGroups.length > 0)) {
      setModalProduct(prod);
      setSelectedVariant(prod.variants && prod.variants.length > 0 ? prod.variants[0] : null);
      setSelectedAddons([]);
      setItemNotes('');
    } else {
      // Agregar directo
      quickAdd(prod, undefined, []);
    }
  };

  const quickAdd = (prod: Product, variant?: Variant, addons: AddonItem[] = [], notes = '') => {
    if (!variant && (prod.basePrice === null || prod.basePrice <= 0)) {
      setNotification({
        message: `El plato "${prod.name}" tiene precio por definir. Debes asignarle precio antes de venderlo.`,
        type: 'error',
      });
      return;
    }

    const base = variant ? variant.price : prod.basePrice ?? 0;
    const addonsTotal = addons.reduce((acc, a) => acc + a.price, 0);
    const unitPrice = base + addonsTotal;

    const newItem: PosCartItem = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product: prod,
      variantName: variant?.name,
      addons,
      quantity: 1,
      unitPrice,
      total: unitPrice,
      notes: notes.trim() || undefined,
    };

    setPosCart((prev) => [...prev, newItem]);
  };

  const confirmModalAdd = () => {
    if (!modalProduct) return;
    quickAdd(modalProduct, selectedVariant || undefined, selectedAddons, itemNotes);
    setModalProduct(null);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQ = item.quantity + delta;
            return { ...item, quantity: newQ, total: item.unitPrice * newQ };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setPosCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Guardar en Mesa / Cuenta abierta
  const handleSaveToTable = () => {
    if (posCart.length === 0) return;

    const targetCustomer = customers.find((c) => c.id === selectedCustomer);
    const newOrder = createOrder({
      origin: 'mesa',
      status: 'en_cocina',
      customer: {
        name: targetCustomer ? targetCustomer.name : `Mesa #${selectedTable}`,
        phone: targetCustomer ? targetCustomer.phone : '3000000000',
        tableNumber: selectedTable,
      },
      items: posCart.map((item, idx) => ({
        id: `pos-item-${Date.now()}-${idx}`,
        productId: item.product.id,
        name: item.product.name,
        variantName: item.variantName,
        addons: item.addons,
        notes: item.notes,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.total,
        readyInKitchen: false,
        station: (item.product.categoryId === 'pizzas' ? 'pizza' : 'parrilla') as 'pizza' | 'parrilla',
      })),
      subtotal,
      discount: calculatedDiscount,
      deliveryFee: 0,
      tip: tipAmount,
      total,
      payments: [],
      cashierId: currentUser?.id,
      cashierName: currentUser?.name,
    });

    // Actualizar mesa a ocupada
    const tableObj = tables.find((t) => t.tableNumber === selectedTable);
    if (tableObj) {
      updateTableStatus(tableObj.id, 'ocupada', newOrder.id, 2);
    }

    playAlertSound('success');
    setNotification({
      message: `Comanda enviada a Cocina y cargada a Mesa #${selectedTable} (${newOrder.code})`,
      type: 'success',
    });
    setPosCart([]);
  };

  // Guardar como Fiado
  const handleSaveToFiado = () => {
    if (posCart.length === 0) return;
    if (!selectedCustomer) {
      alert('Por favor selecciona un cliente registrado para asignar el fiado.');
      return;
    }

    const customerObj = customers.find((c) => c.id === selectedCustomer);
    if (!customerObj) return;

    createOrder({
      origin: 'mostrador',
      status: 'en_cocina',
      customer: {
        id: customerObj.id,
        name: customerObj.name,
        phone: customerObj.phone,
        address: customerObj.address,
      },
      items: posCart.map((item, idx) => ({
        id: `fiado-item-${Date.now()}-${idx}`,
        productId: item.product.id,
        name: item.product.name,
        variantName: item.variantName,
        addons: item.addons,
        notes: item.notes,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.total,
        readyInKitchen: false,
      })),
      subtotal,
      discount: calculatedDiscount,
      deliveryFee: 0,
      total,
      payments: [{ method: 'fiado', amount: total }],
      cashierId: currentUser?.id,
      cashierName: currentUser?.name,
    });

    playAlertSound('success');
    setNotification({
      message: `Pedido cargado al crédito/fiado de ${customerObj.name} (${formatCurrency(total)})`,
      type: 'info',
    });
    setPosCart([]);
  };

  // Cobrar inmediatamente e Imprimir con soporte para pago simple y mixto
  const handleCompletePayment = (printNow = true) => {
    if (isSubmittingPayment) return;
    setIsSubmittingPayment(true);

    try {
      const custObj = customers.find((c) => c.id === selectedCustomer);
      let payments: OrderPayment[] = [];

      if (isMixedPayment) {
        const amt1 = parseFloat(mixedPart1Amount.replace(/\D/g, '')) || 0;
        const amt2 = parseFloat(mixedPart2Amount.replace(/\D/g, '')) || 0;

        if (amt1 <= 0 || amt2 <= 0) {
          setNotification({
            message: 'En pago mixto, debes ingresar un valor mayor a cero en ambas partes.',
            type: 'error',
          });
          return;
        }

        const part1Received = mixedPart1Method === 'efectivo' && cashNum > 0 ? cashNum : amt1;
        if (mixedPart1Method === 'efectivo' && cashNum > 0 && cashNum < amt1) {
          setNotification({
            message: `El efectivo recibido (${formatCurrency(cashNum)}) no cubre la cuota en efectivo (${formatCurrency(amt1)}).`,
            type: 'error',
          });
          return;
        }

        const part1Change = mixedPart1Method === 'efectivo' && cashNum > amt1 ? calculateChange(cashNum, amt1) : 0;

        payments = [
          {
            method: mixedPart1Method,
            amount: amt1,
            receivedAmount: part1Received,
            change: part1Change,
          },
          {
            method: mixedPart2Method,
            amount: amt2,
            receivedAmount: amt2,
            change: 0,
          },
        ];

        const validation = validateOrderPayments(payments, total);
        if (!validation.isValid) {
          setNotification({
            message: validation.error || 'La suma de los pagos no coincide con el total de la orden.',
            type: 'error',
          });
          return;
        }
      } else {
        const received = paymentMethod === 'efectivo' && cashNum > 0 ? cashNum : total;
        if (paymentMethod === 'efectivo' && cashNum > 0 && cashNum < total) {
          setNotification({
            message: `El efectivo recibido (${formatCurrency(cashNum)}) es inferior al total a pagar (${formatCurrency(total)}).`,
            type: 'error',
          });
          return;
        }

        const calculatedChangeDue = paymentMethod === 'efectivo' && cashNum > total ? calculateChange(received, total) : 0;

        payments = [
          {
            method: paymentMethod,
            amount: total,
            receivedAmount: received,
            change: calculatedChangeDue,
          },
        ];
      }

      const newOrder = createOrder({
        origin: orderOrigin,
        status: 'en_cocina',
        customer: {
          id: custObj?.id,
          name: custObj ? custObj.name : `Cliente ${orderOrigin === 'mesa' ? `Mesa #${selectedTable}` : 'Mostrador'}`,
          phone: custObj ? custObj.phone : '3000000000',
          tableNumber: orderOrigin === 'mesa' ? selectedTable : undefined,
        },
        items: posCart.map((item, idx) => ({
          id: `pos-item-${Date.now()}-${idx}`,
          productId: item.product.id,
          name: item.product.name,
          variantName: item.variantName,
          addons: item.addons,
          notes: item.notes,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.total,
          readyInKitchen: false,
          station: (item.product.categoryId === 'pizzas' ? 'pizza' : 'parrilla') as 'pizza' | 'parrilla',
        })),
        subtotal,
        discount: calculatedDiscount,
        deliveryFee: 0,
        tip: tipAmount,
        total,
        payments,
        cashierId: currentUser?.id,
        cashierName: currentUser?.name,
      });

      setLastCompletedOrder(newOrder);
      playAlertSound('order');
      setNotification({
        message: `¡Cobro exitoso ${newOrder.code}! Registrado en caja.`,
        type: 'success',
      });

      if (printNow) {
        setTimeout(() => {
          window.print();
        }, 300);
      }

      setPosCart([]);
      setIsCheckoutModalOpen(false);
      setIsMixedPayment(false);
      setMixedPart1Amount('');
      setMixedPart2Amount('');
      setCashReceived('');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8.5rem)]">
      {/* LEFT: Categories & Products Grid */}
      <div className="flex-1 flex flex-col bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
        {/* Top Search & Category Tabs */}
        <div className="p-3.5 border-b border-brand-border/60 bg-brand-surface-light space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plato en mostrador..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  setSearch('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === c.id && !search
                    ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white border-brand-orange'
                    : 'bg-brand-surface text-brand-cream/70 border-brand-border hover:border-zinc-500'
                }`}
              >
                <span>{c.icon}</span> <span className="ml-1">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProducts.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            const price = hasVariants ? p.variants?.[0].price : p.basePrice;

            return (
              <button
                key={p.id}
                disabled={!p.available}
                onClick={() => handleProductClick(p)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                  p.available
                    ? 'bg-brand-surface-light border-brand-border hover:border-brand-orange/60 hover:bg-zinc-800/60'
                    : 'bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex gap-2.5 items-start">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-brand-border/80 shadow-sm bg-zinc-950">
                    <ProductImage
                      product={p}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-brand-cream line-clamp-1">{p.name}</h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-brand-border/40">
                  <span className="font-black text-xs text-brand-orange">
                    {hasVariants ? 'Desde ' : ''}
                    {price !== null && price !== undefined ? formatCurrency(price) : 'Consultar'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-cream">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Tablet POS Ticket Bar */}
      <div className="w-full lg:w-96 bg-brand-surface border border-brand-border/70 rounded-3xl flex flex-col shadow-xl overflow-hidden">
        {/* Ticket Header & Origin Selector */}
        <div className="p-3.5 border-b border-brand-border/60 bg-brand-surface-light space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'mostrador' as OrderOrigin, label: 'Llevar' },
              { id: 'mesa' as OrderOrigin, label: 'Mesa' },
              { id: 'domicilio' as OrderOrigin, label: 'Domicilio' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setOrderOrigin(t.id)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  orderOrigin === t.id
                    ? 'bg-brand-red text-white border-brand-red shadow-sm'
                    : 'bg-brand-surface text-zinc-400 border-brand-border'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {orderOrigin === 'mesa' ? (
              <div className="flex-1 flex items-center gap-1.5 bg-brand-surface p-1.5 rounded-xl border border-brand-border">
                <Utensils className="w-3.5 h-3.5 text-brand-orange" />
                <span className="text-zinc-400">Mesa:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="bg-transparent font-bold text-brand-cream focus:outline-none flex-1"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.tableNumber} className="bg-zinc-900">
                      Mesa #{t.tableNumber} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-1.5 bg-brand-surface p-1.5 rounded-xl border border-brand-border">
                <User className="w-3.5 h-3.5 text-brand-orange" />
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="bg-transparent text-xs text-brand-cream focus:outline-none flex-1"
                >
                  <option value="" className="bg-zinc-900">Cliente mostrador casual</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {posCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-10 space-y-2">
              <Utensils className="w-8 h-8 stroke-[1.5]" />
              <p className="text-xs font-bold">Ticket vacío</p>
              <p className="text-[10px]">Toca los productos de la izquierda para agregar.</p>
            </div>
          ) : (
            posCart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-brand-surface-light border border-brand-border/60 flex flex-col gap-1.5 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-brand-cream">{item.product.name}</h5>
                    {item.variantName && (
                      <span className="text-[10px] text-brand-orange font-medium block">
                        {item.variantName}
                      </span>
                    )}
                    {item.addons.length > 0 && (
                      <span className="text-[10px] text-zinc-400 block">
                        + {item.addons.map((a) => a.name).join(', ')}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-[10px] text-amber-300 italic block">
                        Nota: {item.notes}
                      </span>
                    )}
                  </div>
                  <span className="font-black text-brand-cream">{formatCurrency(item.total)}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
                  <div className="flex items-center border border-brand-border rounded-lg bg-brand-surface">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 px-2 text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 px-2 text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Calculations & Actions */}
        <div className="p-3.5 bg-brand-surface-light border-t border-brand-border/70 space-y-2.5 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="text-brand-cream">{formatCurrency(subtotal)}</span>
            </div>

            {/* Selector de Descuento rápido */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Descuento:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 p-1 rounded bg-brand-surface border border-brand-border text-right text-xs text-brand-cream"
                />
                <button
                  onClick={() => setDiscountType(discountType === 'percent' ? 'fixed' : 'percent')}
                  className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-[10px] font-bold text-brand-orange"
                >
                  {discountType === 'percent' ? '%' : 'COP'}
                </button>
              </div>
            </div>

            {/* Total final */}
            <div className="flex justify-between items-baseline pt-2 border-t border-brand-border font-black text-sm">
              <span className="text-brand-cream">Total:</span>
              <span className="text-brand-orange text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* POS Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              disabled={posCart.length === 0}
              onClick={handleSaveToTable}
              className="py-2.5 px-2 bg-brand-surface hover:bg-zinc-800 border border-brand-border text-brand-cream font-bold rounded-xl text-xs disabled:opacity-40 transition-colors"
            >
              Guardar en Mesa
            </button>
            <button
              disabled={posCart.length === 0}
              onClick={handleSaveToFiado}
              className="py-2.5 px-2 bg-brand-surface hover:bg-zinc-800 border border-brand-border text-amber-400 font-bold rounded-xl text-xs disabled:opacity-40 transition-colors"
            >
              Guardar en Fiado
            </button>
          </div>

          <button
            disabled={posCart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-black text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobrar {formatCurrency(total)}</span>
          </button>
        </div>
      </div>

      {/* Modal de variantes y adiciones para POS */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-brand-cream">
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-bold text-base text-brand-cream">{modalProduct.name}</h3>
                <p className="text-xs text-zinc-400">{modalProduct.description}</p>
              </div>
              <button onClick={() => setModalProduct(null)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Variantes */}
            {modalProduct.variants && modalProduct.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-orange uppercase block">Variante</span>
                <div className="grid grid-cols-2 gap-2">
                  {modalProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold ${
                        selectedVariant?.id === v.id
                          ? 'bg-brand-red/20 border-brand-red text-white'
                          : 'bg-brand-surface-light border-brand-border text-zinc-400'
                      }`}
                    >
                      <div>{v.name}</div>
                      <div className="text-brand-orange">{formatCurrency(v.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adiciones */}
            {modalProduct.addonGroups && modalProduct.addonGroups.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-orange uppercase block">
                  Adiciones / Papas
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                  {modalProduct.addonGroups.flatMap((g) => g.items).map((a) => {
                    const isChecked = selectedAddons.some((x) => x.id === a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => {
                          if (isChecked) setSelectedAddons(selectedAddons.filter((x) => x.id !== a.id));
                          else setSelectedAddons([...selectedAddons, a]);
                        }}
                        className={`p-2 rounded-xl border text-left text-[11px] font-medium ${
                          isChecked
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-brand-surface-light border-brand-border text-zinc-400'
                        }`}
                      >
                        <div>{a.name}</div>
                        <div className="text-amber-400 font-bold">{formatCurrency(a.price)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Nota para cocina:</span>
              <input
                type="text"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Ej: Sin cebolla, término medio..."
                className="w-full p-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={confirmModalAdd}
                className="flex-1 py-2.5 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
              >
                Agregar al Ticket
              </button>
              <button
                onClick={() => setModalProduct(null)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cobro & Métodos de Pago */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-brand-cream">
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <span className="text-xs text-zinc-400">Total a Cobrar</span>
                <h3 className="font-black text-3xl text-brand-orange">{formatCurrency(total)}</h3>
              </div>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modalidad de Pago: Único vs Mixto */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-brand-border">
              <button
                type="button"
                onClick={() => setIsMixedPayment(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isMixedPayment
                    ? 'bg-brand-orange text-black shadow-sm'
                    : 'text-zinc-400 hover:text-brand-cream'
                }`}
              >
                Pago Único
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMixedPayment(true);
                  if (!mixedPart1Amount && !mixedPart2Amount) {
                    const half = Math.round(total / 2);
                    setMixedPart1Amount(String(half));
                    setMixedPart2Amount(String(total - half));
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMixedPayment
                    ? 'bg-brand-orange text-black shadow-sm'
                    : 'text-zinc-400 hover:text-brand-cream'
                }`}
              >
                Pago Dividido / Mixto
              </button>
            </div>

            {!isMixedPayment ? (
              <>
                {/* Selección de Método de Pago Único */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase block">Método de Pago</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'efectivo' as PaymentMethod, label: 'Efectivo' },
                      { id: 'nequi' as PaymentMethod, label: 'Nequi' },
                      { id: 'daviplata' as PaymentMethod, label: 'Daviplata' },
                      { id: 'tarjeta' as PaymentMethod, label: 'Tarjeta Débito/Crédito' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                          paymentMethod === pm.id
                            ? 'bg-brand-red text-white border-brand-red shadow-sm'
                            : 'bg-brand-surface-light border-brand-border text-zinc-400'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Efectivo y Cálculo de Cambio */}
                {paymentMethod === 'efectivo' && (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-brand-border space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-semibold">¿Efectivo recibido?</span>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder={String(Math.ceil(total / 10000) * 10000)}
                        className="w-32 p-1.5 rounded-lg bg-brand-surface border border-brand-border text-right font-bold text-brand-cream text-xs focus:outline-none focus:border-brand-orange"
                      />
                    </div>

                    {/* Botones de billetes comunes en Colombia */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {[20000, 50000, 100000].map((bill) => (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => setCashReceived(String(bill))}
                          className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-[11px] font-bold text-brand-orange"
                        >
                          ${bill / 1000}k
                        </button>
                      ))}
                    </div>

                    {cashNum >= total && (
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-400 pt-2 border-t border-brand-border">
                        <span>Cambio / Vueltas:</span>
                        <span className="text-base">{formatCurrency(changeDue)}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Configuración de Pago Mixto */
              <div className="space-y-3 p-3 rounded-2xl bg-black/30 border border-brand-border text-xs">
                {/* Parte 1 */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-brand-surface border border-brand-border/60">
                  <div className="flex justify-between items-center font-bold text-zinc-300">
                    <span>Parte 1</span>
                    <select
                      value={mixedPart1Method}
                      onChange={(e) => setMixedPart1Method(e.target.value as PaymentMethod)}
                      className="bg-zinc-800 border border-zinc-700 text-brand-orange rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="nequi">Nequi</option>
                      <option value="daviplata">Daviplata</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs">$</span>
                    <input
                      type="number"
                      value={mixedPart1Amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMixedPart1Amount(val);
                        const num = parseFloat(val) || 0;
                        setMixedPart2Amount(String(Math.max(0, total - num)));
                      }}
                      placeholder="Monto Parte 1"
                      className="flex-1 p-1.5 rounded-lg bg-zinc-900 border border-brand-border font-bold text-brand-cream text-xs focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  {mixedPart1Method === 'efectivo' && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Efectivo recibido:</span>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="Monto entregado"
                        className="w-28 p-1 rounded bg-zinc-900 border border-zinc-700 text-right text-brand-cream text-[11px]"
                      />
                    </div>
                  )}
                </div>

                {/* Parte 2 */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-brand-surface border border-brand-border/60">
                  <div className="flex justify-between items-center font-bold text-zinc-300">
                    <span>Parte 2</span>
                    <select
                      value={mixedPart2Method}
                      onChange={(e) => setMixedPart2Method(e.target.value as PaymentMethod)}
                      className="bg-zinc-800 border border-zinc-700 text-brand-orange rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="nequi">Nequi</option>
                      <option value="daviplata">Daviplata</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs">$</span>
                    <input
                      type="number"
                      value={mixedPart2Amount}
                      onChange={(e) => setMixedPart2Amount(e.target.value)}
                      placeholder="Monto Parte 2"
                      className="flex-1 p-1.5 rounded-lg bg-zinc-900 border border-brand-border font-bold text-brand-cream text-xs focus:outline-none focus:border-brand-orange"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const p1 = parseFloat(mixedPart1Amount) || 0;
                        setMixedPart2Amount(String(Math.max(0, total - p1)));
                      }}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded text-zinc-300 border border-zinc-600"
                    >
                      Restante
                    </button>
                  </div>
                </div>

                {/* Cuadre de pago mixto */}
                {(() => {
                  const p1 = parseFloat(mixedPart1Amount) || 0;
                  const p2 = parseFloat(mixedPart2Amount) || 0;
                  const sum = p1 + p2;
                  const diff = total - sum;
                  return (
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Total cubierto:</span>
                      <span className={`font-bold ${diff === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatCurrency(sum)} / {formatCurrency(total)}{' '}
                        {diff !== 0 && `(${diff > 0 ? `Falta ${formatCurrency(diff)}` : `Sobra ${formatCurrency(Math.abs(diff))}`})`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Botones de Finalización */}
            <div className="flex gap-2 pt-2">
              <button
                disabled={isSubmittingPayment}
                onClick={() => handleCompletePayment(true)}
                className={`flex-1 py-3 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-black rounded-xl text-xs shadow-glow-red flex items-center justify-center gap-1.5 ${
                  isSubmittingPayment ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>{isSubmittingPayment ? 'Procesando...' : 'Cobrar e Imprimir (80mm)'}</span>
              </button>
              <button
                disabled={isSubmittingPayment}
                onClick={() => handleCompletePayment(false)}
                className={`px-4 py-3 bg-brand-surface-light border border-brand-border hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs ${
                  isSubmittingPayment ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Solo Cobrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Thermal Receipt for Print */}
      {lastCompletedOrder && (
        <div className="hidden print:block">
          <ThermalReceipt order={lastCompletedOrder} />
        </div>
      )}
    </div>
  );
};
