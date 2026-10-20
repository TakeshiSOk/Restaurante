import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../lib/utils';
import { ProductImage } from '../common/ProductImage';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, addToCart, products } = useAppStore();

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);

  // Cross-sell suggestions: adiciones o bebidas si no hay bebidas en el carrito
  const hasDrinks = cart.some((i) => i.product.categoryId === 'bebidas');
  const suggestedDrinks = products.filter((p) => p.categoryId === 'bebidas' && p.available).slice(0, 2);

  const handleQuickAddDrink = (prod: typeof products[0]) => {
    addToCart({
      product: prod,
      unitPrice: prod.basePrice ?? 4500,
      addons: [],
      quantity: 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#141210] border-l border-brand-border flex flex-col shadow-2xl animate-slide-left text-brand-cream">
        {/* Header */}
        <div className="p-4 border-b border-brand-border/60 bg-brand-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-orange" />
            <h2 className="font-display text-xl font-black tracking-wide">Tu Pedido</h2>
            <span className="text-xs bg-brand-red text-white px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-zinc-400 hover:text-red-400 p-1.5 transition-colors"
                title="Vaciar carrito"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-zinc-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-zinc-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-brand-cream text-base">Tu carrito está vacío</p>
              <p className="text-xs max-w-xs text-zinc-400">
                Explora nuestro menú y añade tus salchipapas, hamburguesas y asados favoritos.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-brand-surface hover:bg-brand-surface-light border border-brand-orange/40 text-brand-orange text-xs font-bold rounded-xl"
              >
                Ver Menú
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border/70 flex flex-col gap-2.5 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2.5">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-brand-border/70 shadow-sm bg-zinc-950">
                        <ProductImage
                          product={item.product}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-brand-cream line-clamp-1">{item.product.name}</h4>
                        {item.variantName && (
                          <p className="text-xs text-brand-orange font-medium">
                            Opción: {item.variantName}
                          </p>
                        )}
                        {item.addons.length > 0 && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                            ➕ {item.addons.map((a) => a.name).join(', ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-amber-300/80 italic mt-0.5 line-clamp-1">
                            Nota: "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-brand-border/40">
                    <div className="flex items-center border border-brand-border rounded-lg bg-brand-surface-light">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="p-1 px-2 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="p-1 px-2 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-black text-sm text-brand-cream">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Sugerencias de bebidas (Cross-selling) */}
              {!hasDrinks && suggestedDrinks.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-blue-500/20 space-y-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>¿Deseas agregar una bebida bien fría?</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {suggestedDrinks.map((drink) => (
                      <button
                        key={drink.id}
                        onClick={() => handleQuickAddDrink(drink)}
                        className="p-2 rounded-xl bg-black/40 border border-blue-500/30 text-left hover:border-cyan-400 transition-all text-xs"
                      >
                        <div className="font-semibold text-white line-clamp-1">{drink.name}</div>
                        <div className="text-cyan-400 font-bold mt-0.5">
                          +{formatCurrency(drink.basePrice)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 bg-brand-surface border-t border-brand-border/80 space-y-3">
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="font-black text-lg text-brand-cream">{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              * El costo de envío se calcula según tu dirección en el siguiente paso.
            </p>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-black text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Confirmar Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
