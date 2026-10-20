import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useAppStore } from '../../store/useAppStore';
import { ShoppingBag, MessageCircle, MapPin, Clock, X, Info } from 'lucide-react';

interface MenuHeaderProps {
  onOpenCart: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ onOpenCart }) => {
  const { settings, cart } = useAppStore();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="relative bg-[#141210] border-b border-brand-border/60 pt-4 pb-5 px-4 md:px-8 shadow-xl">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-brand-red/10 via-brand-orange/5 to-transparent blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <BrandLogo size="md" />

            {/* Mobile Cart Trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onOpenCart}
                className="relative p-2.5 bg-brand-surface rounded-xl border border-brand-orange/30 text-brand-orange hover:bg-brand-surface-light active:scale-95 transition-all shadow-md"
                aria-label="Ver carrito"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick info & actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto text-xs">
            {/* Estado Abierto/Cerrado */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                settings.isOpen
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="font-semibold">{settings.isOpen ? 'Abierto ahora' : 'Cerrado temporalmente'}</span>
            </div>

            {/* Horario */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-cream/80">
              <Clock className="w-3.5 h-3.5 text-brand-orange" />
              <span>{settings.scheduleText}</span>
            </div>

            {/* Botón Cómo llegar */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-cream hover:border-brand-orange/50 hover:bg-brand-surface-light transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-red-light" />
              <span>Cómo llegar</span>
            </button>

            {/* Botón WhatsApp */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hola%20Chaves%20Burguer!%20Quisiera%20información.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 transition-all font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            {/* Desktop Cart Button */}
            <button
              onClick={onOpenCart}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-bold rounded-xl shadow-glow-red transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver mi pedido</span>
              {cartItemsCount > 0 && (
                <span className="ml-1 bg-white text-brand-red text-xs px-2 py-0.5 rounded-full font-black">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Ubicación */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-brand-cream">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-red/20 rounded-xl text-brand-red-light">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-wide">Ubicación & Horarios</h3>
                <p className="text-xs text-brand-cream/70">Ven a disfrutar en nuestro local</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-black/30 border border-brand-border/60">
                <span className="text-xs text-brand-orange font-semibold block uppercase">Dirección</span>
                <p className="font-medium text-brand-cream mt-0.5">{settings.address}</p>
                <p className="text-xs text-zinc-400">{settings.city}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-brand-border/60">
                <span className="text-xs text-brand-orange font-semibold block uppercase">Horario de atención</span>
                <p className="font-medium text-brand-cream mt-0.5">{settings.scheduleText}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-brand-border/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-300">
                  Contamos con servicio a la mesa, pedidos para llevar y domicilios en toda la ciudad.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.name} ${settings.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 text-center bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-xl text-sm transition-colors"
              >
                Abrir en Google Maps
              </a>
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
