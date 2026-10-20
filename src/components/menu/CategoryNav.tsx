import React, { useRef, useState, useEffect } from 'react';
import { Category } from '../../types';
import { Search, Flame, Leaf, X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'all' | 'popular' | 'vegetarian';
  onFilterChange: (filter: 'all' | 'popular' | 'vegetarian') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scrollByDelta = (delta: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const handleSelect = (catId: string) => {
    onSelectCategory(catId);
    const pill = document.getElementById(`cat-pill-${catId}`);
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-[#0C0A09]/95 backdrop-blur-md border-b border-brand-border/60 py-3 px-4 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Search, Filter & Quick Category Jump */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search box & Mobile Category Jump */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar plato: salchipapa, burguer, pizza, alitas..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs sm:text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Category Jump Selector for Mobile */}
            <div className="relative sm:hidden shrink-0">
              <select
                aria-label="Seleccionar categoría"
                value={activeCategoryId}
                onChange={(e) => handleSelect(e.target.value)}
                className="px-2.5 py-2 bg-brand-surface border border-brand-border text-brand-cream text-xs font-bold rounded-xl focus:outline-none focus:border-brand-orange"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeFilter === 'all'
                  ? 'bg-brand-red text-white border-brand-red shadow-glow-red'
                  : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600'
              }`}
            >
              Todos los platos
            </button>
            <button
              onClick={() => onFilterChange('popular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeFilter === 'popular'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-glow-amber'
                  : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Más Populares</span>
            </button>
            <button
              onClick={() => onFilterChange('vegetarian')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeFilter === 'vegetarian'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-brand-surface text-brand-cream/80 border-brand-border hover:border-zinc-600'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vegetariano</span>
            </button>
          </div>
        </div>

        {/* Scrollable Category Carousel with Arrows & Indicators */}
        <div className="relative group">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByDelta(-240)}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-brand-orange hover:text-black text-brand-cream border border-brand-border items-center justify-center shadow-lg transition-all"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Left & Right subtle edge gradients */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0C0A09] to-transparent z-10 transition-opacity ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0C0A09] to-transparent z-10 transition-opacity ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Categories scrollable pill row */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth overscroll-x-contain"
          >
            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-pill-${cat.id}`}
                  onClick={() => handleSelect(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border active:scale-95 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white border-brand-orange shadow-md'
                      : 'bg-brand-surface text-brand-cream/70 border-brand-border hover:border-brand-border/80 hover:text-brand-cream'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByDelta(240)}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-brand-orange hover:text-black text-brand-cream border border-brand-border items-center justify-center shadow-lg transition-all"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
