import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MenuHeader } from '../../components/menu/MenuHeader';
import { CategoryNav } from '../../components/menu/CategoryNav';
import { ProductCard } from '../../components/menu/ProductCard';
import { ProductDetailModal } from '../../components/menu/ProductDetailModal';
import { CartDrawer } from '../../components/menu/CartDrawer';
import { CheckoutModal } from '../../components/menu/CheckoutModal';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, ChefHat } from 'lucide-react';

export const DigitalMenuPage: React.FC = () => {
  const { categories, products, cart, addToCart, setNotification } = useAppStore();

  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || 'burgers');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'vegetarian'>('all');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
        // Si no hay búsqueda global, filtrar por la categoría seleccionada
        if (prod.categoryId !== activeCategoryId) return false;
      }

      // Filtros rápidos
      if (activeFilter === 'popular' && !prod.popular) return false;
      if (activeFilter === 'vegetarian') {
        const hasVegetarianTag = prod.tags?.some((t) => t.toLowerCase().includes('vegetariano') || t.toLowerCase().includes('sin carne'));
        if (!hasVegetarianTag) return false;
      }

      return true;
    });
  }, [products, categories, activeCategoryId, searchQuery, activeFilter]);

  const currentCategory = categories.find((c) => c.id === activeCategoryId);
  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex flex-col">
      {/* Header */}
      <MenuHeader onOpenCart={() => setIsCartOpen(true)} />

      {/* Hero Announcement Banner */}
      <section className="relative px-4 py-6 bg-gradient-to-r from-brand-red/20 via-brand-surface to-brand-orange/15 border-b border-brand-border/60 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
              <Sparkles className="w-3 h-3" />
              <span>Sabor Casero & Porciones Monumentales</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-brand-cream tracking-wide">
              Menú Digital Chaves Burguer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Salchipapas para compartir, hamburguesas 100% caseras, pizzas artesanales y asados al carbón.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3.5 py-2 bg-brand-surface hover:bg-brand-surface-light border border-brand-border hover:border-brand-orange/50 text-xs font-semibold rounded-xl text-zinc-300 transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-brand-orange" />
              <span>Acceso Administrador</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Category and Search Nav */}
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
      />

      {/* Main Products Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Category Description & Info */}
        {!searchQuery && currentCategory && (
          <div className="flex items-baseline justify-between border-b border-brand-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentCategory.icon}</span>
                <h2 className="font-display text-2xl font-black tracking-wide text-brand-cream">
                  {currentCategory.name}
                </h2>
              </div>
              {currentCategory.description && (
                <p className="text-xs text-zinc-400 mt-0.5">{currentCategory.description}</p>
              )}
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        )}

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="flex items-baseline justify-between border-b border-brand-border/60 pb-3">
            <h2 className="text-sm font-semibold text-zinc-300">
              Resultados para: <span className="text-brand-orange font-bold">"{searchQuery}"</span>
            </h2>
            <span className="text-xs text-zinc-400">{filteredProducts.length} encontrados</span>
          </div>
        )}

        {/* Empty state */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-500">
              <ChefHat className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-brand-cream">No encontramos platos con ese criterio</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Intenta buscar por otro nombre o selecciona otra categoría en la barra superior.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="px-4 py-2 bg-brand-surface border border-brand-orange/40 text-brand-orange text-xs font-bold rounded-xl"
            >
              Ver todos los platos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const cat = categories.find((c) => c.id === product.categoryId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={cat}
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

      {/* Floating Cart Button (Mobile bottom sticky) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 md:hidden animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-brand-red to-brand-orange text-white font-black rounded-2xl shadow-glow-red flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-brand-red text-xs flex items-center justify-center font-black">
                {totalCartCount}
              </span>
              <span>Ver mi pedido</span>
            </div>
            <span>
              {/* Cart Subtotal */}
              Subtotal: {cart.reduce((a, b) => a + b.total, 0) > 0 ? `$${cart.reduce((a, b) => a + b.total, 0).toLocaleString('es-CO')}` : ''}
            </span>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
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

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-border/60 bg-[#12100E] py-8 px-4 text-center text-xs text-zinc-500">
        <p className="font-semibold text-brand-cream/80">Chaves Burguer · Fast Food · Restaurant · Drink</p>
        <p className="mt-1">Menú digital para demostración interactiva en celular, tablet y escritorio.</p>
        <p className="text-[10px] text-zinc-600 mt-3">
          Sistema demo frontend con almacenamiento local sincronizado en tiempo real.
        </p>
      </footer>
    </div>
  );
};
