import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings,
  Store,
  QrCode,
  Users,
  Award,
  Palette,
  RefreshCw,
  Download,
  Upload,
  Printer,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  FileCode,
} from 'lucide-react';

export const SettingsAdminPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    staff,
    resetToDemoData,
    exportDatabaseJson,
    importDatabaseJson,
    setNotification,
  } = useAppStore();

  const [businessName, setBusinessName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber);
  const [address, setAddress] = useState(settings.address);
  const [schedule, setSchedule] = useState(settings.scheduleText);

  const [qrTableNumber, setQrTableNumber] = useState('1');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showPins, setShowPins] = useState(false);

  const menuUrl = window.location.origin;
  const qrTargetUrl = `${menuUrl}/?mesa=${qrTableNumber}`;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: businessName,
      tagline,
      phone,
      whatsappNumber: whatsapp,
      address,
      scheduleText: schedule,
    });
    setNotification({
      message: 'Configuración del restaurante guardada con éxito.',
      type: 'success',
    });
  };

  const handleExport = () => {
    const dataStr = exportDatabaseJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chaves_burguer_backup_${Date.now()}.json`;
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
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
          Configuración General & QR
        </h1>
        <p className="text-xs text-zinc-400">
          Personalización del restaurante, códigos QR de mesas, usuarios demo y copias de seguridad
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: General Info Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveGeneral}
            className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
              <Store className="w-5 h-5 text-brand-orange" />
              <h3 className="font-bold text-base text-brand-cream">Datos del Restaurante</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Nombre comercial:</label>
                <input
                  type="text"
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

            <button
              type="submit"
              className="py-2.5 px-5 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Guardar Cambios
            </button>
          </form>

          {/* Usuarios y PINs */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-orange" />
                <h3 className="font-bold text-base text-brand-cream">Personal & Códigos PIN</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="px-2.5 py-1 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border rounded-lg text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5 text-brand-orange" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{showPins ? 'Ocultar PINs' : 'Mostrar PINs'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {staff.map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-brand-surface-light border border-brand-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-brand-cream">{s.name}</h4>
                      <span className="text-[10px] text-brand-orange uppercase font-semibold">
                        Rol: {s.role}
                      </span>
                    </div>
                    <span className="font-mono font-black text-xs bg-black/50 px-2 py-0.5 rounded border border-brand-border text-white">
                      PIN: {showPins ? s.pin : '••••'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backup & Reset Demo */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-brand-cream">Respaldo & Demostración</h3>
            <p className="text-xs text-zinc-400">
              Exporta la base de datos completa como JSON para respaldarla o restablece los 60 días de datos deterministas originales.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Base de Datos (JSON)</span>
              </button>
              <button
                onClick={() => setShowJsonModal(true)}
                className="px-4 py-2.5 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Importar JSON</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Restablecer todos los datos demo a su estado inicial de 60 días?')) {
                    resetToDemoData();
                  }
                }}
                className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restablecer Datos Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: QR Code Generator for Tables */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-brand-orange font-bold text-xs uppercase">
              <QrCode className="w-4 h-4" />
              <span>Generador de Código QR</span>
            </div>

            <h3 className="font-display text-2xl font-black text-brand-cream">
              QR para Mesa #{qrTableNumber}
            </h3>
            <p className="text-xs text-zinc-400">
              Escanea para abrir el Menú Digital con el número de mesa preseleccionado.
            </p>

            <div className="flex justify-center my-3">
              <div className="p-4 bg-white rounded-2xl shadow-xl inline-block border-4 border-brand-orange">
                <QRCodeSVG value={qrTargetUrl} size={180} level="M" />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-zinc-300 font-semibold block">Número de mesa para el QR:</label>
              <div className="flex justify-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQrTableNumber(String(num))}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                      qrTableNumber === String(num)
                        ? 'bg-brand-orange text-black border-brand-orange'
                        : 'bg-brand-surface-light border-brand-border text-zinc-400'
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
              className="w-full py-3 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir QR para Acrílico</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL IMPORTAR JSON */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-brand-cream">
            <h3 className="font-display text-2xl font-black text-brand-cream">
              Importar Datos (JSON)
            </h3>
            <p className="text-xs text-zinc-400">
              Selecciona un archivo <code>.json</code> exportado o pega el contenido estructurado de la base de datos:
            </p>

            <div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      if (text) setJsonInput(text);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-surface-light file:text-brand-orange hover:file:bg-zinc-800"
              />
            </div>

            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="O pega aquí el contenido JSON exportado previamente..."
              className="w-full p-3 rounded-xl bg-brand-surface-light border border-brand-border text-xs font-mono text-brand-cream focus:outline-none focus:border-brand-orange"
            />
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="flex-1 py-3 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
              >
                Restaurar Base de Datos
              </button>
              <button
                onClick={() => {
                  setShowJsonModal(false);
                  setJsonInput('');
                }}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
