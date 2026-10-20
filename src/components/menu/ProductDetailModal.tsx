import React, { useState } from 'react';
import { Product, Variant, AddonItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ProductImage } from '../common/ProductImage';
import { useAppStore } from '../../store/useAppStore';
import { X, Plus, Minus, Check, Flame } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const addToCart = useAppStore((s) => s.addToCart);

  // Selección de variante (por defecto la primera si existen variantes)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  // Selección de adiciones
  const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([]);

  // Cantidad y notas
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const toggleAddon = (addon: AddonItem) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const isPriceValid = (selectedVariant !== null && selectedVariant.price > 0) || (product.basePrice !== null && product.basePrice > 0);
  const unitBasePrice = selectedVariant ? selectedVariant.price : (product.basePrice ?? 0);
  const addonsTotalPerUnit = selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const singleItemTotal = unitBasePrice + addonsTotalPerUnit;
  const totalPrice = singleItemTotal * quantity;

  const handleAddToCart = () => {
    if (!isPriceValid) return;
    const ok = addToCart({
      product,
      variantName: selectedVariant?.name,
      unitPrice: singleItemTotal,
      addons: selectedAddons,
      quantity,
      notes: notes.trim() || undefined,
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-surface border border-brand-border rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-brand-cream animate-slide-up">
        {/* Product Image Banner */}
        <div className="relative h-52 w-full bg-zinc-950 flex items-center justify-center border-b border-brand-border/60 overflow-hidden shrink-0">
          <ProductImage
            product={product}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-black/50 pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-zinc-300 hover:text-white transition-colors z-20 backdrop-blur-sm"
            aria-label="Cerrar modal de producto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="relative p-5 border-b border-brand-border/60 bg-brand-surface-light flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-black text-brand-cream tracking-wide">
                {product.name}
              </h2>
              {product.popular && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                  <Flame className="w-3 h-3 fill-black" />
                  Popular
                </span>
              )}
            </div>
            <p className="text-xs text-brand-cream/70 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-brand-border/40">
          {/* Variantes (ej. tamaño pizza) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                Selecciona el tamaño / opción <span className="text-brand-red">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-brand-red/15 border-brand-red text-white shadow-sm'
                          : 'bg-brand-surface-light border-brand-border text-brand-cream/80 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-brand-red bg-brand-red' : 'border-zinc-500'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-semibold">{v.name}</span>
                      </div>
                      <span className="font-bold text-sm text-brand-orange">
                        {formatCurrency(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grupos de adiciones */}
          {product.addonGroups && product.addonGroups.length > 0 && (
            <div className="space-y-4 pt-4">
              {product.addonGroups.map((group) => (
                <div key={group.id} className="space-y-2.5">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                      {group.name}
                    </label>
                    <span className="text-[11px] text-zinc-400">
                      {group.minSelect > 0 ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {group.items.map((item) => {
                      const isChecked = selectedAddons.some((a) => a.id === item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAddon(item)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            isChecked
                              ? 'bg-amber-500/15 border-amber-500 text-white'
                              : 'bg-brand-surface-light border-brand-border text-brand-cream/80 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isChecked ? 'border-amber-500 bg-amber-500 text-black' : 'border-zinc-500'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-brand-cream">
                            {item.price > 0 ? `+${formatCurrency(item.price)}` : 'Sin costo'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instrucciones / Notas especiales */}
          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-brand-cream/90 uppercase tracking-wider block">
              Notas o instrucciones especiales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, salsas aparte, carne bien asada..."
              rows={2}
              className="w-full p-3 rounded-xl bg-brand-surface-light border border-brand-border text-sm text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div className="p-4 bg-brand-surface-light border-t border-brand-border/60 flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-brand-border rounded-xl bg-brand-surface p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 text-zinc-300"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-base min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 text-zinc-300"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            disabled={!isPriceValid}
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 font-bold rounded-xl flex items-center justify-between text-sm transition-all ${
              isPriceValid
                ? 'bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white shadow-glow-red active:scale-98'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>{isPriceValid ? 'Agregar al pedido' : 'Precio no disponible'}</span>
            <span>{isPriceValid ? formatCurrency(totalPrice) : 'Consultar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
