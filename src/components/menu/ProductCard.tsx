import React from 'react';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ProductImage } from '../common/ProductImage';
import { Plus, Flame, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  category?: Category;
  onSelect: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, category, onSelect, onQuickAdd }) => {
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
      className={`group relative flex flex-col justify-between bg-brand-surface border border-brand-border/70 rounded-2xl overflow-hidden transition-all duration-200 shadow-md ${
        isOrderable
          ? 'hover:border-brand-orange/60 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]'
          : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* Top Graphic Header with Clean Real Food Image */}
      <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
        <ProductImage
          product={product}
          alt={product.name}
          categoryIcon={category?.icon}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-black/20 to-black/40 pointer-events-none" />

        {/* Badges row */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1.5">
          {product.popular ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-md">
              <Flame className="w-3 h-3 fill-black" />
              <span>POPULAR</span>
            </span>
          ) : (
            <span />
          )}

          {!isAvailable && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md">
              AGOTADO
            </span>
          )}

          {product.basePrice === null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900/90 text-amber-300 border border-amber-400/40 shadow-md">
              <AlertCircle className="w-3 h-3" />
              <span>Precio por definir</span>
            </span>
          )}
        </div>

        {/* Category Pill Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="text-[11px] font-bold text-white bg-black/65 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <span>{category?.icon || '🍔'}</span>
            <span>{category?.name || 'Chaves'}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-brand-cream group-hover:text-brand-orange transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-brand-cream/65 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-brand-surface-light border border-brand-border text-zinc-300 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Price & Button */}
        <div className="pt-2.5 border-t border-brand-border/60 flex items-center justify-between gap-2">
          <div>
            {hasVariants && <span className="text-[10px] text-zinc-400 block -mb-0.5 font-medium">Desde</span>}
            <span className="font-black text-base text-brand-cream">
              {lowestPrice !== null && lowestPrice !== undefined ? formatCurrency(lowestPrice) : 'Consultar precio'}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              isOrderable
                ? 'bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white shadow-glow-red active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
            aria-label={lowestPrice === null ? 'Precio por consultar' : `Agregar ${product.name}`}
          >
            {isOrderable && <Plus className="w-3.5 h-3.5" />}
            <span>{!isAvailable ? 'Agotado' : lowestPrice === null ? 'Consultar' : requiresCustomization ? 'Personalizar' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
