import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { QRCodeSVG } from 'qrcode.react';
import { BRAND_PALETTES, BrandPalette, applyBrandTheme } from '../../lib/brandTheme';
import { AVAILABLE_PRESETS, RestaurantConfig } from '../../config/restaurant.config';
import {
  Settings,
  Store,
  QrCode,
  Users,
  Palette,
  RefreshCw,
  Download,
  Upload,
  Printer,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Check,
  Sliders,
  ShieldCheck,
  Flame,
  UserPlus,
  Shield,
  X,
} from 'lucide-react';
import { StaffRole } from '../../types';

export const SettingsAdminPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    staff,
    addStaff,
    updateStaff,
    resetToDemoData,
    resetToEmptyData,
    exportDatabaseJson,
    importDatabaseJson,
    setNotification,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Marca
  const [businessName, setBusinessName] = useState(settings.name || 'Chaves Burguer');
  const [tagline, setTagline] = useState(settings.tagline || 'Fast Food · Hamburguesas Artesanales');
  const [phone, setPhone] = useState(settings.phone || '311 555 0192');
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber || '573115550192');
  const [address, setAddress] = useState(settings.address || 'Calle 14 # 8-42, Parque Principal');
  const [schedule, setSchedule] = useState(settings.scheduleText || 'Lunes a Domingo: 11:30 am - 11:00 pm');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#B91C1C');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor || '#F59E0B');
  const [selectedPaletteId, setSelectedPaletteId] = useState(settings.colorPaletteId || 'fuego-parrillero');

  // Estados de Demo y QR
  const [qrTableNumber, setQrTableNumber] = useState('1');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showPins, setShowPins] = useState(false);

  // Estados para simular registro de nuevo usuario/cliente
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    pin: '1234',
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.phone.trim()) {
      alert('Por favor ingresa nombre y teléfono del usuario.');
      return;
    }
    addStaff({
      name: newUserForm.name.trim(),
      role: 'cliente',
      phone: newUserForm.phone.trim(),
      email: newUserForm.email.trim() || undefined,
      pin: newUserForm.pin.trim() || '1234',
      active: true,
      registeredAt: new Date().toISOString(),
    });
    setNotification({
      message: `Usuario "${newUserForm.name}" registrado como Cliente. Ya puedes asignarle un rol de empleado si lo deseas.`,
      type: 'success',
    });
    setNewUserForm({ name: '', phone: '', email: '', pin: '1234' });
    setNewUserModalOpen(false);
  };

  const menuUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const qrTargetUrl = qrTableNumber === 'general' ? menuUrl : `${menuUrl}/?mesa=${qrTableNumber}`;

  // Aplicar paleta predefinida
  const handleSelectPalette = (palette: BrandPalette) => {
    setSelectedPaletteId(palette.id);
    setPrimaryColor(palette.primaryColor);
    setSecondaryColor(palette.secondaryColor);

    updateSettings({
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      colorPaletteId: palette.id,
    });

    applyBrandTheme({
      ...settings,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
    });

    setNotification({
      message: `Paleta "${palette.name}" aplicada al instante.`,
      type: 'success',
    });
  };

  // Aplicar Preset completo de Restaurante (Marca Blanca)
  const handleSelectPreset = (preset: RestaurantConfig) => {
    setBusinessName(preset.name);
    setTagline(preset.tagline);
    setPhone(preset.contact.phone);
    setWhatsapp(preset.contact.whatsappNumber);
    setAddress(preset.contact.address);
    setSchedule(preset.contact.scheduleText);
    setPrimaryColor(preset.theme.primaryColor);
    setSecondaryColor(preset.theme.secondaryColor);
    setSelectedPaletteId('');

    updateSettings({
      name: preset.name,
      tagline: preset.tagline,
      heroBadge: preset.heroBadge,
      heroHeadline: preset.heroHeadline,
      legalName: preset.legalName,
      nit: preset.nit,
      instagram: preset.contact.instagram,
      phone: preset.contact.phone,
      whatsappNumber: preset.contact.whatsappNumber,
      address: preset.contact.address,
      city: preset.contact.city,
      scheduleText: preset.contact.scheduleText,
      primaryColor: preset.theme.primaryColor,
      secondaryColor: preset.theme.secondaryColor,
      printTicketHeader: preset.ticket.header,
      printTicketFooter: preset.ticket.footer,
      loyaltyPointsPer1000: preset.loyalty.pointsPer1000,
      pointValueInCop: preset.loyalty.pointValueInCop,
    });

    applyBrandTheme({
      ...settings,
      name: preset.name,
      primaryColor: preset.theme.primaryColor,
      secondaryColor: preset.theme.secondaryColor,
    });

    setNotification({
      message: `¡Modo "${preset.name}" activado exitosamente!`,
      type: 'success',
    });
  };

  // Subir logo desde archivo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        updateSettings({ logoUrl: result });
        setNotification({
          message: 'Logotipo cargado y aplicado.',
          type: 'success',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar Marca y Datos Generales
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: businessName,
      tagline,
      phone,
      whatsappNumber: whatsapp,
      address,
      scheduleText: schedule,
      logoUrl: logoUrl.trim() || undefined,
      primaryColor,
      secondaryColor,
      colorPaletteId: selectedPaletteId,
    });

    applyBrandTheme({
      ...settings,
      name: businessName,
      tagline,
      primaryColor,
      secondaryColor,
    });

    setNotification({
      message: 'Marca, colores y datos del negocio actualizados en todo el sistema.',
      type: 'success',
    });
  };

  // Alternar Modo Presentación
  const handleTogglePresentationMode = () => {
    const nextMode = !settings.presentationMode;
    updateSettings({ presentationMode: nextMode });
    setNotification({
      message: nextMode
        ? 'Modo Presentación Activado: Se ocultaron PINs, nómina y exportación JSON para una demo limpia.'
        : 'Modo Presentación Desactivado: Mostrando todos los módulos técnicos.',
      type: 'info',
    });
  };

  // Reiniciar a datos demo realistas (Fase 1)
  const handleConfirmResetDemo = () => {
    const ok = confirm(
      '¿Restablecer datos demo completos?\n\n' +
      'Se cargarán 24 productos con fotos reales, 18 clientes, 30 días de ventas con gráficos y pedidos activos en KDS.'
    );
    if (ok) {
      resetToDemoData();
      setBusinessName('Chaves Burguer');
      setTagline('Fast Food · Hamburguesas Artesanales & Sabor Colombiano');
      setPhone('311 555 0192');
      setWhatsapp('573115550192');
      setAddress('Calle 14 # 8-42, Parque Principal');
      setLogoUrl('');
      setPrimaryColor('#B91C1C');
      setSecondaryColor('#F59E0B');
      setSelectedPaletteId('fuego-parrillero');
    }
  };

  // Iniciar con sistema vacío
  const handleConfirmResetEmpty = () => {
    const ok = confirm(
      '¿Iniciar con sistema vacío?\n\n' +
      'Se borrarán los productos, clientes, pedidos y caja para que puedas registrar los de un cliente prospecto desde cero.'
    );
    if (ok) {
      resetToEmptyData();
      setBusinessName('Mi Restaurante');
      setTagline('Comidas Rápidas & Sabor Artesanal');
    }
  };

  const handleExport = () => {
    const dataStr = exportDatabaseJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `restaurante_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!jsonInput.trim()) return;
    const ok = importDatabaseJson(jsonInput);
    if (ok) {
      setShowJsonModal(false);
      setJsonInput('');
      setNotification({
        message: 'Base de datos importada correctamente.',
        type: 'success',
      });
    } else {
      alert('Formato JSON inválido o estructura no compatible.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Switch Modo Presentación */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-brand-surface border border-brand-border/70 shadow-sm">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide flex items-center gap-2">
            <Sliders className="w-6 h-6 text-brand-orange" />
            <span>Configuración & Marca</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Personaliza el nombre, colores, logo y controla los datos de demostración
          </p>
        </div>

        {/* Interruptor Modo Presentación (FASE 4) */}
        <div className="flex items-center gap-3 bg-black/40 border border-brand-border p-2.5 px-4 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-cream flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              <span>Modo Presentación</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              {settings.presentationMode ? 'Ocultando complejidad (PINs, nómina)' : 'Vista técnica completa'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTogglePresentationMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
              settings.presentationMode ? 'bg-brand-orange' : 'bg-zinc-800'
            }`}
            title="Activar/desactivar modo presentación"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.presentationMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Marca y Datos del Restaurante (FASE 3) */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveBrand}
            className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-5 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-brand-orange" />
                <h3 className="font-bold text-base text-brand-cream">Marca del Negocio & Colores</h3>
              </div>
              <span className="text-[10px] text-zinc-400">Aplica en Menú, POS y Recibos</span>
            </div>

            {/* Selector de Presets de Marca Blanca (Ideal para demos de venta) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-orange/15 via-brand-surface-light to-brand-surface border border-brand-orange/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demostración de Plantilla Marca Blanca (Presets)</span>
                </label>
                <span className="text-[10px] text-zinc-400">1 clic para transformar la app</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {AVAILABLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.name === preset.name
                        ? 'bg-zinc-900 border-brand-orange ring-1 ring-brand-orange shadow-md'
                        : 'bg-brand-surface border-brand-border hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.theme.primaryColor }} />
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.theme.secondaryColor }} />
                      <span className="font-bold text-xs text-brand-cream truncate">{preset.name}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{preset.tagline}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Paletas Predefinidas */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                Paletas de Colores Rápidas (1 Clic)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {BRAND_PALETTES.map((palette) => {
                  const isSelected = selectedPaletteId === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => handleSelectPalette(palette)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                        isSelected
                          ? 'bg-zinc-900 border-brand-orange shadow-md ring-1 ring-brand-orange'
                          : 'bg-brand-surface-light border-brand-border hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black shadow"
                            style={{ backgroundColor: palette.primaryColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black shadow"
                            style={{ backgroundColor: palette.secondaryColor }}
                          />
                        </div>
                        <span className="font-semibold text-brand-cream text-[11px]">{palette.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-orange" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colores Personalizados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1.5 p-3 rounded-2xl bg-brand-surface-light border border-brand-border">
                <label className="text-zinc-300 font-semibold block">Color Principal:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setSelectedPaletteId('custom');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setSelectedPaletteId('custom');
                    }}
                    className="flex-1 p-1.5 rounded-lg bg-black/50 border border-brand-border text-brand-cream font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-brand-surface-light border border-brand-border">
                <label className="text-zinc-300 font-semibold block">Color Secundario / Acento:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setSelectedPaletteId('custom');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setSelectedPaletteId('custom');
                    }}
                    className="flex-1 p-1.5 rounded-lg bg-black/50 border border-brand-border text-brand-cream font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Logo del Restaurante */}
            <div className="space-y-2 pt-2 border-t border-brand-border/50">
              <label className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                Logotipo del Restaurante
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-brand-surface-light border border-brand-border">
                <div className="w-16 h-16 rounded-xl bg-black/60 border border-brand-border flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Flame className="w-8 h-8 text-brand-orange" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-brand-surface hover:bg-zinc-800 border border-brand-border rounded-lg text-xs font-semibold text-brand-cream flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Subir Imagen</span>
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl('');
                          updateSettings({ logoUrl: undefined });
                        }}
                        className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="O pega una URL de imagen (https://...)"
                    className="w-full p-2 rounded-lg bg-black/50 border border-brand-border text-xs text-brand-cream focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Datos de Contacto y Ubicación */}
            <div className="space-y-3 pt-2 border-t border-brand-border/50">
              <label className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                Datos de Identidad & Contacto
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Nombre comercial:</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-brand-cream focus:outline-none focus:border-brand-orange font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Tagline / Lema:</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-brand-cream focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Teléfono de atención:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-brand-cream focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">WhatsApp para pedidos:</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-brand-cream focus:outline-none focus:border-brand-orange font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-semibold">Dirección física:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-brand-cream focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-semibold">Horario de atención al público:</label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-brand-cream focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red hover:opacity-95 transition-opacity"
            >
              Guardar Marca & Datos
            </button>
          </form>

          {/* FASE 2: Modo Demo & Control de Datos */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              <div>
                <h3 className="font-bold text-base text-brand-cream">Modo Demo & Control de Datos</h3>
                <p className="text-xs text-zinc-400">Prepara la aplicación para presentar a tus clientes prospecto</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Botón Reiniciar Datos Demo */}
              <button
                type="button"
                onClick={handleConfirmResetDemo}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/30 hover:border-amber-500/60 text-left space-y-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                    <RefreshCw className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Recomendado
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-cream text-sm">Reiniciar Datos Demo</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Carga 24 productos con fotos, 18 clientes, 30 días de ventas y pedidos activos en KDS.
                  </p>
                </div>
              </button>

              {/* Botón Iniciar Vacío */}
              <button
                type="button"
                onClick={handleConfirmResetEmpty}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-700/60 hover:border-zinc-500 text-left space-y-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-zinc-800 text-zinc-300 group-hover:scale-110 transition-transform">
                    <Trash2 className="w-4 h-4 text-zinc-400" />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                    En Blanco
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-cream text-sm">Iniciar Sistema Vacío</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Limpia productos y pedidos para empezar a ingresar el menú y clientes reales del restaurante.
                  </p>
                </div>
              </button>
            </div>

            {/* Opciones de Respaldo JSON (Ocultadas en Modo Presentación) */}
            {!settings.presentationMode && (
              <div className="pt-3 border-t border-brand-border/60 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3.5 py-2 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border rounded-xl font-semibold text-zinc-300 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Exportar Copia (JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonModal(true)}
                  className="px-3.5 py-2 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border rounded-xl font-semibold text-zinc-300 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Importar JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Usuarios, Clientes y Asignación de Roles por Super Administrador */}
          {!settings.presentationMode ? (
            <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-orange" />
                  <div>
                    <h3 className="font-bold text-base text-brand-cream">Gestión de Usuarios & Asignación de Roles</h3>
                    <p className="text-[11px] text-zinc-400">
                      Super Administrador: Asigna roles de empleado a los usuarios registrados
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserModalOpen(true)}
                    className="px-3 py-1.5 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Registrar Usuario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="px-2.5 py-1.5 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                  >
                    {showPins ? <EyeOff className="w-3.5 h-3.5 text-brand-orange" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>{showPins ? 'Ocultar' : 'PINs'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-2xl bg-brand-surface-light border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      s.role === 'dueno'
                        ? 'border-red-500/40 bg-red-950/10'
                        : s.role === 'cliente'
                        ? 'border-brand-border/80 bg-zinc-900/40'
                        : 'border-brand-border'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-brand-cream text-sm">{s.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            s.role === 'dueno'
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : s.role === 'administrador'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                              : s.role === 'cajero'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : s.role === 'cocinero'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : s.role === 'domiciliario'
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {s.role === 'dueno'
                            ? 'Super Admin (Dueño)'
                            : s.role === 'cliente'
                            ? 'Cliente Registrado'
                            : s.role}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            s.active ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          ● {s.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                        <span>Tel: {s.phone}</span>
                        {s.email && <span>Email: {s.email}</span>}
                        {s.registeredAt && (
                          <span className="text-[10px] text-zinc-500">
                            Reg: {new Date(s.registeredAt).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                      {/* Asignar Rango / Rol */}
                      <div className="space-y-0.5">
                        <label className="text-[10px] text-zinc-400 block font-semibold">
                          Asignar Rango:
                        </label>
                        <select
                          value={s.role}
                          onChange={(e) => {
                            const newRole = e.target.value as StaffRole;
                            updateStaff(s.id, { role: newRole });
                            setNotification({
                              message: `Rol de "${s.name}" actualizado a ${newRole.toUpperCase()}.`,
                              type: 'info',
                            });
                          }}
                          className="p-1.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                        >
                          <option value="cliente">Cliente (Sin permisos)</option>
                          <option value="cajero">Cajero (POS y Caja)</option>
                          <option value="cocinero">Cocinero (KDS Cocina)</option>
                          <option value="domiciliario">Domiciliario (Repartidor)</option>
                          <option value="administrador">Administrador</option>
                          <option value="dueno">Super Administrador (Dueño)</option>
                        </select>
                      </div>

                      {/* PIN de Acceso */}
                      <div className="space-y-0.5 text-right">
                        <label className="text-[10px] text-zinc-400 block font-semibold">PIN:</label>
                        <span className="font-mono font-black text-xs bg-black/60 px-2 py-1.5 rounded-xl border border-brand-border text-brand-orange inline-block">
                          {showPins ? s.pin : '••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-black/30 border border-brand-border/40 text-center text-xs text-zinc-500">
              🔒 Personal, clientes y PINs ocultos por <strong>Modo Presentación</strong>.
            </div>
          )}
        </div>

        {/* Columna Derecha: Generador de QR */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-brand-orange font-bold text-xs uppercase">
              <QrCode className="w-4 h-4" />
              <span>Generador de Código QR</span>
            </div>

            <h3 className="font-display text-2xl font-black text-brand-cream">
              {qrTableNumber === 'general' ? 'QR Menú Digital (General)' : `QR para Mesa #${qrTableNumber}`}
            </h3>
            <p className="text-xs text-zinc-400">
              {qrTableNumber === 'general'
                ? 'Escanea para abrir la carta digital completa (ideal para mostrador, pendón o redes sociales).'
                : 'Escanea para abrir el Menú Digital con el número de mesa preseleccionado para pedir desde la mesa.'}
            </p>

            <div className="flex justify-center my-3">
              <div className="p-4 bg-white rounded-2xl shadow-xl inline-block border-4 border-brand-orange">
                <QRCodeSVG value={qrTargetUrl} size={180} level="M" />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-zinc-300 font-semibold block">Seleccionar destino del código QR:</label>
              <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
                <button
                  type="button"
                  onClick={() => setQrTableNumber('general')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    qrTableNumber === 'general'
                      ? 'bg-brand-orange text-black border-brand-orange shadow-sm'
                      : 'bg-brand-surface-light border-brand-border text-zinc-400 hover:text-white'
                  }`}
                >
                  🌐 Menú General
                </button>
                <div className="h-4 w-px bg-brand-border mx-1" />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQrTableNumber(String(num))}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                      qrTableNumber === String(num)
                        ? 'bg-brand-orange text-black border-brand-orange shadow-sm'
                        : 'bg-brand-surface-light border-brand-border text-zinc-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-zinc-500 break-all">{qrTargetUrl}</p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <Printer className="w-4 h-4" />
              <span>{qrTableNumber === 'general' ? 'Imprimir QR de Menú Digital' : `Imprimir QR para Mesa #${qrTableNumber}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Importar JSON */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-brand-cream">
            <h3 className="font-display text-2xl font-black text-brand-cream">
              Importar Datos (JSON)
            </h3>
            <p className="text-xs text-zinc-400">
              Pega el contenido estructurado de la base de datos exportada previamente:
            </p>

            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"schemaVersion": 2, "appName": "...", ...}'
              className="w-full p-3 rounded-xl bg-black/50 border border-brand-border font-mono text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleImport}
                className="flex-1 py-2.5 bg-brand-orange text-black font-bold rounded-xl text-xs shadow-sm hover:bg-brand-amber transition-colors"
              >
                Cargar Base de Datos
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowJsonModal(false);
                  setJsonInput('');
                }}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Registrar Nuevo Usuario (Simulación de Registro) */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-orange" />
                <h3 className="font-display text-xl font-black text-brand-cream">
                  Registrar Nuevo Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewUserModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Al registrarse, el usuario entra por defecto con el rango <strong>Cliente</strong>. Como Super Administrador, podrás asignarle rol de empleado (Cajero, Cocinero, Domiciliario o Admin) en cualquier momento.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Andrés Felipe Castillo"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Celular / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 3124567890"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  placeholder="Ej: andres.castillo@gmail.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">PIN de Acceso (4 dígitos)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={newUserForm.pin}
                  onChange={(e) => setNewUserForm({ ...newUserForm, pin: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream font-mono focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-brand-border/60">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all shadow-md"
                >
                  Confirmar Registro
                </button>
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
