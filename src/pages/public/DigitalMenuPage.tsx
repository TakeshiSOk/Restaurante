import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MenuHeader } from '../../components/menu/MenuHeader';
import { CategoryNav } from '../../components/menu/CategoryNav';
import { ProductCard } from '../../components/menu/ProductCard';
import { ProductDetailModal } from '../../components/menu/ProductDetailModal';
import { CartDrawer } from '../../components/menu/CartDrawer';
import { CheckoutModal } from '../../components/menu/CheckoutModal';
import { Product, Order } from '../../types';
import { Link } from 'react-router-dom';
import {
  Lock,
  Sparkles,
  ChefHat,
  Search,
  Bike,
  X,
  ArrowRight,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { formatTime, formatCurrency } from '../../lib/utils';
import { StatusBadge } from '../../components/common/Badge';

export const DigitalMenuPage: React.FC = () => {
  const { categories, products, cart, addToCart, setNotification, settings, orders } = useAppStore();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'vegetarian'>('all');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Modal de rastreo de pedidos
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Pedido activo recordado en el dispositivo del cliente
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  // Altura del header principal para que la barra de categorías se fije exactamente debajo
  const [headerHeight, setHeaderHeight] = useState(56);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const el = document.getElementById('main-menu-header');
      if (el) {
        setHeaderHeight(el.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('chaves_last_order_code');
      if (savedCode) {
        setLastOrderCode(savedCode);
      }
    } catch {
      // ignore
    }
  }, [orders]);

  const activeOrder = useMemo(() => {
    if (!lastOrderCode) return null;
    const found = orders.find((o) => o.code.toUpperCase() === lastOrderCode.toUpperCase());
    if (found && found.status !== 'cancelado' && found.status !== 'entregado') {
      return found;
    }
    return null;
  }, [orders, lastOrderCode]);

  // Manejador de búsqueda en modal de rastreo
  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingInput.trim().toUpperCase();
    if (!query) return;

    const byCode = orders.filter((o) => o.code.toUpperCase().includes(query));
    const cleanPhoneQuery = query.replace(/\D/g, '');
    const byPhone =
      cleanPhoneQuery.length >= 7
        ? orders.filter((o) => o.customer.phone.replace(/\D/g, '').includes(cleanPhoneQuery))
        : [];

    const combined = Array.from(new Set([...byCode, ...byPhone]));
    setTrackedOrders(combined);
    setHasSearched(true);
  };

  // Filtrado de productos en vivo
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Búsqueda por texto (nombre, descripción, categoría)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(query);
        const matchDesc = prod.description.toLowerCase().includes(query);
        const matchCat = categories.find((c) => c.id === prod.categoryId)?.name.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      } else {
        // Si no hay búsqueda global y no está en 'all', filtrar por categoría
        if (activeCategoryId !== 'all' && prod.categoryId !== activeCategoryId) {
          return false;
        }
      }

      // Filtros rápidos
      if (activeFilter === 'popular' && !prod.popular) return false;
      if (activeFilter === 'vegetarian') {
        const hasVegetarianTag = prod.tags?.some(
          (t) => t.toLowerCase().includes('vegetariano') || t.toLowerCase().includes('sin carne')
        );
        if (!hasVegetarianTag) return false;
      }

      return true;
    });
  }, [products, categories, activeCategoryId, searchQuery, activeFilter]);

  const currentCategory = activeCategoryId !== 'all' ? categories.find((c) => c.id === activeCategoryId) : null;
  const isBrowsingAllOrSearch = activeCategoryId === 'all' || Boolean(searchQuery.trim());
  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.total, 0);

  // Estado con color claro y legible para el banner de pedido activo
  const getActiveOrderStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'recibido':
        return { label: 'Recibido', colorBadge: 'bg-amber-400 text-black font-black' };
      case 'en_cocina':
        return { label: 'En cocina', colorBadge: 'bg-orange-500 text-white font-black' };
      case 'listo':
        return { label: 'Listo', colorBadge: 'bg-emerald-500 text-white font-black' };
      case 'en_camino':
        return { label: 'En camino', colorBadge: 'bg-sky-400 text-black font-black' };
      default:
        return { label: (status as string).replace('_', ' '), colorBadge: 'bg-zinc-600 text-white font-bold' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex flex-col pb-20 md:pb-0">
      {/* 1. Header (Sticky, max-h 64px, totalmente despejado arriba sin saturación) */}
      <MenuHeader
        hasActiveOrder={Boolean(activeOrder)}
        onOpenTracking={() => {
          setIsTrackingModalOpen(true);
          setHasSearched(false);
          setTrackingInput(lastOrderCode || '');
        }}
      />

      {/* 4. BANNER DE PEDIDO ACTIVO (Barra delgada en colores de marca, código, estado claro y botón) */}
      {activeOrder && (
        <div className="bg-[#181410] border-b border-brand-orange/40 px-3 sm:px-6 py-2 shadow-sm animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-zinc-300 font-medium hidden sm:inline">Pedido activo:</span>
              <span className="font-mono font-black text-brand-orange text-sm shrink-0">
                {activeOrder.code}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide ${
                  getActiveOrderStatusInfo(activeOrder.status).colorBadge
                }`}
              >
                {getActiveOrderStatusInfo(activeOrder.status).label}
              </span>
            </div>

            <Link
              to={`/pedido/${activeOrder.code}`}
              className="px-3 py-1 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-lg text-xs flex items-center gap-1 transition-all shrink-0 active:scale-95"
            >
              <span>Ver seguimiento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. HERO COMPACTO (Máx. ~120px en móvil, sin títulos repetidos, productos visibles de inmediato) */}
      <section className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-brand-red/15 via-[#14110E] to-brand-orange/10 border-b border-brand-border/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/25 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Sabor casero & porciones monumentales</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-brand-cream">
              ¡Pide en línea y disfruta de la mejor comida rápida artesanal!
            </h1>
          </div>

          {/* Horario en línea pequeña secundaria */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 shrink-0">
            <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span>{settings.scheduleText || 'Lunes a Domingo: 11:30 am - 11:00 pm'}</span>
          </div>
        </div>
      </section>

      {/* Alerta de Restaurante Cerrado (si aplica) */}
      {!settings.isOpen && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-3 py-1.5 text-center text-xs text-red-200">
          <span className="font-bold">⚠️ Local cerrado en este momento:</span> {settings.scheduleText || 'Pronto abriremos'}. Puedes explorar la carta y preparar tu orden.
        </div>
      )}

      {/* 5. BUSCADOR Y FILTROS UNIFICADOS (Con [Rastrear Pedido] y [Ver mi pedido] integrados a la derecha) */}
      <CategoryNav
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={(id) => {
          setActiveCategoryId(id);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        stickyTopOffset={headerHeight}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setIsTrackingModalOpen(true);
          setHasSearched(false);
          setTrackingInput(lastOrderCode || '');
        }}
        hasActiveOrder={Boolean(activeOrder)}
        cartCount={totalCartCount}
        cartTotal={cartSubtotal}
      />

      {/* 6 & 7. GRILLA DE PRODUCTOS Y TÍTULOS DE SECCIÓN LIMPIOS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Título de Sección Limpio (Nombre + Cantidad de productos) */}
        {!searchQuery && (
          <div className="flex items-baseline justify-between pt-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">
                {activeFilter === 'popular'
                  ? '🔥'
                  : activeFilter === 'vegetarian'
                  ? '🌱'
                  : currentCategory
                  ? currentCategory.icon
                  : '🍽️'}
              </span>
              <h2 className="font-display text-lg sm:text-2xl font-black tracking-wide text-brand-cream">
                {activeFilter === 'popular'
                  ? 'Platos Más Populares'
                  : activeFilter === 'vegetarian'
                  ? 'Opciones Vegetarianas'
                  : currentCategory
                  ? currentCategory.name
                  : 'Todos los platos'}
              </h2>
              <span className="text-xs font-semibold text-zinc-400">
                ({filteredProducts.length})
              </span>
            </div>

            {currentCategory?.description && activeFilter === 'all' && (
              <p className="text-xs text-zinc-400 hidden sm:block max-w-sm truncate text-right">
                {currentCategory.description}
              </p>
            )}
          </div>
        )}

        {/* Resumen de búsqueda */}
        {searchQuery && (
          <div className="flex items-baseline justify-between pt-1 pb-1">
            <h2 className="text-sm font-semibold text-zinc-300">
              Resultados para: <span className="text-brand-orange font-bold">"{searchQuery}"</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">({filteredProducts.length})</span>
          </div>
        )}

        {/* Estado Vacío */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-500">
              <ChefHat className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-brand-cream">No encontramos platos con ese criterio</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Intenta buscar por otro nombre o elige otra categoría en la barra superior.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setActiveCategoryId('all');
              }}
              className="px-4 py-2 bg-brand-surface border border-brand-orange/40 text-brand-orange text-xs font-bold rounded-xl hover:bg-brand-surface-light"
            >
              Ver todos los platos
            </button>
          </div>
        ) : (
          /* Grilla Responsive: 1 columna en móvil (tarjeta horizontal compacta), 2 en tablet, 3-4 en desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const cat = categories.find((c) => c.id === product.categoryId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={cat}
                  showCategoryBadge={isBrowsingAllOrSearch}
                  onSelect={(p) => setSelectedProduct(p)}
                  onQuickAdd={(p) => {
                    const ok = addToCart({
                      product: p,
                      unitPrice: p.basePrice || 0,
                      quantity: 1,
                      addons: [],
                    });
                    if (ok) {
                      setNotification({
                        message: `¡${p.name} agregado al pedido!`,
                        type: 'success',
                      });
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* 8. CARRITO FLOTANTE (Solo móvil, formato exacto: "Ver pedido · 3 productos · $45.000") */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-3 z-40 md:hidden animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-2xl shadow-glow-red flex items-center justify-between text-xs sm:text-sm active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-1.5 truncate">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="font-extrabold whitespace-nowrap">Ver pedido</span>
              <span className="text-white/60">·</span>
              <span className="whitespace-nowrap">
                {totalCartCount} {totalCartCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <span className="font-black text-amber-200 shrink-0 text-sm">
              {formatCurrency(cartSubtotal)}
            </span>
          </button>
        </div>
      )}

      {/* Modales y Drawers */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* MODAL RASTREAR PEDIDO */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-brand-orange" />
                <h3 className="font-display text-lg font-black text-brand-cream">
                  Rastrear mi Pedido
                </h3>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Si ya hay un pedido activo guardado */}
            {activeOrder && (
              <div className="p-3.5 rounded-2xl bg-brand-surface-light border border-brand-orange/40 space-y-2">
                <span className="text-[11px] text-zinc-400 block font-semibold">
                  Último pedido realizado desde este dispositivo:
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-brand-orange text-base block">
                      {activeOrder.code}
                    </span>
                    <span className="text-xs text-zinc-300">
                      Estado: <strong className="capitalize">{activeOrder.status.replace('_', ' ')}</strong>
                    </span>
                  </div>
                  <Link
                    to={`/pedido/${activeOrder.code}`}
                    onClick={() => setIsTrackingModalOpen(false)}
                    className="px-3.5 py-2 bg-brand-orange hover:bg-brand-amber text-black font-black rounded-xl text-xs flex items-center gap-1 shadow-sm"
                  >
                    <span>Ver Rastreo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Formulario de Búsqueda */}
            <form onSubmit={handleSearchTracking} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">
                  Buscar por Código (#CH-XXXX) o Celular:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: CH-0230 o 3101234567"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Consultar Estado</span>
              </button>
            </form>

            {/* Resultados de búsqueda */}
            {hasSearched && (
              <div className="space-y-2 pt-2 border-t border-brand-border/60">
                <span className="text-xs font-bold text-zinc-400 block">
                  {trackedOrders.length === 0 ? 'No encontramos pedidos' : `Pedidos encontrados (${trackedOrders.length}):`}
                </span>

                {trackedOrders.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-3">
                    Verifica que el código o el número de celular coincidan con los que registraste al comprar.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {trackedOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-brand-surface-light border border-brand-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-black text-brand-orange block">
                            {o.code}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(o.createdAt).toLocaleDateString('es-CO')} · {formatTime(o.createdAt)}
                          </span>
                          <div className="mt-0.5">
                            <StatusBadge status={o.status} size="sm" />
                          </div>
                        </div>

                        <Link
                          to={`/pedido/${o.code}`}
                          onClick={() => setIsTrackingModalOpen(false)}
                          className="px-3 py-1.5 bg-brand-surface hover:bg-zinc-800 border border-brand-border text-brand-cream font-bold rounded-lg text-xs"
                        >
                          Ver
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer discreto */}
      <footer className="mt-auto border-t border-brand-border/60 bg-[#12100E] py-6 px-4 text-center text-xs text-zinc-500 space-y-2">
        <p className="font-semibold text-brand-cream/80">{settings.name}</p>
        <p className="text-[11px] text-zinc-400">
          {settings.scheduleText || 'Todos los días'} · WhatsApp: {settings.whatsappNumber}
        </p>

        {/* Acceso discreto para empleados al final */}
        <div className="pt-3 border-t border-zinc-800/60 flex justify-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-brand-orange transition-colors py-1 px-3 rounded-lg hover:bg-zinc-900/50"
          >
            <Lock className="w-3 h-3 text-zinc-500" />
            <span>Acceso para Personal</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};
