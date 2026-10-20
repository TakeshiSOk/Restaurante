import React from 'react';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ProductImage } from '../common/ProductImage';
import { Plus, Flame, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  category?: Category;
  showCategoryBadge?: boolean;
  onSelect: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  showCategoryBadge = false,
  onSelect,
  onQuickAdd,
}) => {
  const isAvailable = product.available;
  const hasVariants = product.variants && product.variants.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...(product.variants?.map((v) => v.price) || [0]))
    : product.basePrice;

  const isOrderable = isAvailable && lowestPrice !== null;
  const requiresCustomization = hasVariants || (product.addonGroups && product.addonGroups.length > 0);

  return (
    <div
      onClick={() => isOrderable && onSelect(product)}
      className={`group relative flex flex-row sm:flex-col justify-between bg-brand-surface border border-brand-border/70 rounded-2xl overflow-hidden transition-all duration-200 shadow-md ${
        isOrderable
          ? 'hover:border-brand-orange/60 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]'
          : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* Zona de Imagen (Proporción 4:3, izquierda en móvil, arriba en sm+) */}
      <div className="relative w-32 sm:w-full h-32 sm:h-44 aspect-[4/3] shrink-0 bg-zinc-950 overflow-hidden">
        <ProductImage
          product={product}
          alt={product.name}
          categoryIcon={category?.icon}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Badges superiores (Popular / Agotado / Precio pendiente) */}
        <div className="absolute top-2 inset-x-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
          {product.popular ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md">
              <Flame className="w-2.5 h-2.5 fill-black" />
              <span>POPULAR</span>
            </span>
          ) : (
            <span />
          )}

          {!isAvailable && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-md">
              AGOTADO
            </span>
          )}

          {product.basePrice === null && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-900/90 text-amber-300 border border-amber-400/40 shadow-md">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Por definir</span>
            </span>
          )}
        </div>

        {/* Badge de Categoría (SOLO se muestra en "Todos" o búsqueda, nunca redundante dentro de categoría) */}
        {showCategoryBadge && category && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="text-[10px] font-bold text-white bg-black/75 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1 shadow-sm">
              <span>{category.icon}</span>
              <span className="max-w-[80px] sm:max-w-none truncate">{category.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta (Derecha en móvil, abajo en sm+) */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0 gap-2">
        <div>
          {/* Título en una sola línea */}
          <h3 className="font-bold text-sm sm:text-base text-brand-cream group-hover:text-brand-orange transition-colors truncate">
            {product.name}
          </h3>

          {/* Descripción en máximo 2 líneas */}
          <p className="text-xs text-brand-cream/65 mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Tags de ingredientes (Máximo 2, discretos) */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {product.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-brand-surface-light border border-brand-border text-zinc-400 font-medium truncate max-w-[110px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pie con Precio y Botón Agregar */}
        <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            {hasVariants && <span className="text-[10px] text-zinc-400 block -mb-0.5 font-medium">Desde</span>}
            <span className="font-black text-sm sm:text-base text-brand-cream truncate block">
              {lowestPrice !== null && lowestPrice !== undefined ? formatCurrency(lowestPrice) : 'Consultar'}
            </span>
          </div>

          <button
            type="button"
            disabled={!isOrderable}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOrderable) return;
              if (onQuickAdd && !requiresCustomization) {
                onQuickAdd(product);
              } else {
                onSelect(product);
              }
            }}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
              isOrderable
                ? 'bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white shadow-glow-red active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
            aria-label={lowestPrice === null ? 'Precio por consultar' : `Agregar ${product.name}`}
          >
            {isOrderable && <Plus className="w-3.5 h-3.5" />}
            <span className="whitespace-nowrap">
              {!isAvailable
                ? 'Agotado'
                : lowestPrice === null
                ? 'Ver'
                : requiresCustomization
                ? 'Elegir'
                : 'Agregar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
