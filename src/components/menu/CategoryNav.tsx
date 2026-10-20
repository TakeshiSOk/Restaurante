import React, { useRef } from 'react';
import { Category } from '../../types';
import { Search, Flame, Leaf, X, LayoutGrid, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'all' | 'popular' | 'vegetarian';
  onFilterChange: (filter: 'all' | 'popular' | 'vegetarian') => void;
  stickyTopOffset?: number;
  onOpenCart?: () => void;
  onOpenTracking?: () => void;
  hasActiveOrder?: boolean;
  cartCount?: number;
  cartTotal?: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  stickyTopOffset = 56,
  onOpenCart,
  onOpenTracking,
  hasActiveOrder = false,
  cartCount = 0,
  cartTotal = 0,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleChipClick = (type: 'all' | 'popular' | 'vegetarian' | string) => {
    if (type === 'all') {
      onFilterChange('all');
      onSelectCategory('all');
    } else if (type === 'popular') {
      onFilterChange('popular');
      onSelectCategory('all');
    } else if (type === 'vegetarian') {
      onFilterChange('vegetarian');
      onSelectCategory('all');
    } else {
      onFilterChange('all');
      onSelectCategory(type);
    }

    const chipEl = document.getElementById(`chip-${type}`);
    if (chipEl) {
      chipEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const isAllActive = activeFilter === 'all' && (activeCategoryId === 'all' || !activeCategoryId);
  const isPopularActive = activeFilter === 'popular';
  const isVegActive = activeFilter === 'vegetarian';

  return (
    <div
      className="sticky z-30 bg-[#0C0A09]/95 backdrop-blur-md border-b border-brand-border/60 py-2.5 px-3 sm:px-6 shadow-md transition-all"
      style={{ top: `${stickyTopOffset}px` }}
    >
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* 1. Fila Superior: Buscador + [ Rastrear Pedido ] + [ Ver mi pedido ] */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o ingrediente..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs sm:text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rastrear Pedido (Reubicado aquí para descongestionar el header superior) */}
          {!hasActiveOrder && onOpenTracking && (
            <button
              type="button"
              onClick={onOpenTracking}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface-light border border-brand-orange/50 hover:border-brand-orange text-brand-orange text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95 whitespace-nowrap"
              title="Rastrear pedido en vivo"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Rastrear Pedido</span>
            </button>
          )}

          {/* BOTÓN VER MI PEDIDO (Reubicado aquí abajo para dejar el header superior limpio) */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md shrink-0 whitespace-nowrap ${
                cartCount > 0
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white shadow-glow-red'
                  : 'bg-brand-surface hover:bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white'
              }`}
              aria-label="Ver mi pedido"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="font-extrabold hidden xs:inline sm:inline">Ver mi pedido</span>
              <span className="font-extrabold xs:hidden sm:hidden">Pedido</span>

              {/* Badge contador */}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  cartCount > 0
                    ? 'bg-white text-brand-red'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {cartCount}
              </span>

              {/* Subtotal en vivo */}
              {cartTotal > 0 && (
                <span className="hidden md:inline pl-1.5 border-l border-white/30 text-xs font-bold text-amber-200">
                  {formatCurrency(cartTotal)}
                </span>
              )}
            </button>
          )}
        </div>

        {/* 2. UNA SOLA FILA de chips con scroll horizontal (Todos, Populares, Vegetariano + Categorías) */}
        <div className="relative">
          {/* Degradados sutiles en los bordes para indicar scroll sin tapar botones */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#0C0A09] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0C0A09] to-transparent z-10" />

          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth overscroll-x-contain"
          >
            {/* Chip: Todos */}
            <button
              type="button"
              id="chip-all"
              onClick={() => handleChipClick('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border active:scale-95 shrink-0 ${
                isAllActive
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white border-brand-orange shadow-md'
                  : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Todos</span>
            </button>

            {/* Chip: Populares */}
            <button
              type="button"
              id="chip-popular"
              onClick={() => handleChipClick('popular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border active:scale-95 shrink-0 ${
                isPopularActive
                  ? 'bg-amber-500 text-black border-amber-500 shadow-glow-amber'
                  : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600 hover:text-white'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isPopularActive ? 'fill-black text-black' : 'text-amber-400'}`} />
              <span>Populares</span>
            </button>

            {/* Chip: Vegetariano */}
            <button
              type="button"
              id="chip-vegetarian"
              onClick={() => handleChipClick('vegetarian')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border active:scale-95 shrink-0 ${
                isVegActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600 hover:text-white'
              }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${isVegActive ? 'text-white' : 'text-emerald-400'}`} />
              <span>Vegetariano</span>
            </button>

            {/* Chips de Categorías */}
            {categories.map((cat) => {
              const isCatActive = !isPopularActive && !isVegActive && activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`chip-${cat.id}`}
                  type="button"
                  onClick={() => handleChipClick(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border active:scale-95 shrink-0 ${
                    isCatActive
                      ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white border-brand-orange shadow-md'
                      : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
