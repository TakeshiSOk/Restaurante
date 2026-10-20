import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useAppStore } from '../../store/useAppStore';
import {
  MessageCircle,
  MapPin,
  Clock,
  X,
  Search,
  User,
  Menu as MenuIcon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface MenuHeaderProps {
  onOpenTracking?: () => void;
  hasActiveOrder?: boolean;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  onOpenTracking,
  hasActiveOrder = false,
}) => {
  const { settings } = useAppStore();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hola%20Chaves%20Burguer!%20Quisiera%20información.`;

  return (
    <>
      {/* Header Sticky y Totalmente Despejado (h-14 sm:h-16, sin botones saturados) */}
      <header
        id="main-menu-header"
        className="sticky top-0 z-40 bg-[#12100E]/95 backdrop-blur-md border-b border-brand-border/70 h-14 sm:h-16 px-3 sm:px-6 shadow-xl transition-all"
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-3">
          {/* Lado Izquierdo: Logo + Nombre compacto + Badge Abierto/Cerrado */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link to="/" className="shrink-0 flex items-center">
              <BrandLogo size="sm" showTagline={false} />
            </Link>

            {/* Badge de Abierto/Cerrado pequeño */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all shrink-0 active:scale-95 ${
                settings.isOpen
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              }`}
              title="Toca para ver horario completo"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="whitespace-nowrap">{settings.isOpen ? 'Abierto' : 'Cerrado'}</span>
            </button>
          </div>

          {/* Lado Derecho: Accesos limpios y discretos (WhatsApp, Cómo llegar, Ingresar) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Enlaces Discretos en Escritorio (md+) */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface hover:bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-emerald-400 transition-colors font-semibold whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              {/* Cómo llegar */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface hover:bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white transition-colors font-semibold whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-red-light" />
                <span>Cómo llegar</span>
              </button>

              {/* Ingresar */}
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface hover:bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white transition-colors font-semibold whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Ingresar</span>
              </Link>
            </div>

            {/* WhatsApp directo en móvil */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 transition-colors"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Botón Menú Hamburguesa en Móvil (md:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-brand-surface border border-brand-border text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              aria-label="Abrir menú de opciones"
            >
              <MenuIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Menú Drawer / Lateral en Móvil */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-72 max-w-[85vw] h-full bg-[#141210] border-l border-brand-border p-5 flex flex-col justify-between shadow-2xl animate-slide-left">
            {/* Header del Menú */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Menú & Opciones
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enlaces */}
              <div className="space-y-2">
                {/* Rastrear Pedido */}
                {!hasActiveOrder && onOpenTracking && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenTracking();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-surface border border-brand-orange/40 text-brand-orange font-bold text-xs hover:bg-brand-surface-light text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4" />
                      <span>Rastrear mi pedido</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-orange/60" />
                  </button>
                )}

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-semibold text-xs hover:bg-emerald-950/50"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Oficial</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400/70" />
                </a>

                {/* Cómo llegar */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLocationModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-surface border border-brand-border text-zinc-200 font-semibold text-xs hover:bg-brand-surface-light text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-red-light" />
                    <span>Cómo llegar y Sede</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>

                {/* Horarios */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowScheduleModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-surface border border-brand-border text-zinc-200 font-semibold text-xs hover:bg-brand-surface-light text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Horario de atención</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>

                {/* Ingresar */}
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-surface border border-brand-border text-zinc-200 font-semibold text-xs hover:bg-brand-surface-light"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>Ingresar al Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>
              </div>
            </div>

            {/* Info inferior en el drawer */}
            <div className="pt-4 border-t border-brand-border/60 text-[11px] text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-300">{settings.name}</p>
              <p className="line-clamp-2">{settings.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ubicación y Cómo llegar */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-brand-cream">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-brand-red/20 text-brand-red border border-brand-red/30">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-cream">Nuestra Sede</h3>
                <p className="text-xs text-zinc-400">Pasa por tu pedido o visítanos en el local</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-surface-light border border-brand-border space-y-1">
                <span className="font-bold text-brand-orange block">Dirección:</span>
                <p className="text-zinc-200 font-medium">{settings.address}</p>
              </div>

              <div className="p-3 rounded-xl bg-brand-surface-light border border-brand-border space-y-1">
                <span className="font-bold text-brand-orange block">Horarios de Atención:</span>
                <p className="text-zinc-200 font-medium">{settings.scheduleText}</p>
              </div>
            </div>

            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full mt-5 py-2.5 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-brand-cream font-bold rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Horarios */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-brand-cream space-y-4">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-cream">Horario de Atención</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      settings.isOpen ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {settings.isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-surface-light border border-brand-border text-xs space-y-1">
              <span className="font-bold text-brand-orange block">Jornada habitual:</span>
              <p className="text-zinc-200">{settings.scheduleText || 'Lunes a Domingo: 11:30 am - 11:00 pm'}</p>
            </div>

            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full py-2.5 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-brand-cream font-bold rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
