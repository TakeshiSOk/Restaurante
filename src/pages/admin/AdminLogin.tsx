import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, UserCheck, KeyRound, Lock, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { Staff } from '../../types';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { staff, loginWithPin } = useAppStore();

  const [pin, setPin] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(staff[0] || null);
  const [error, setError] = useState('');
  const [showDemoPinModal, setShowDemoPinModal] = useState(false);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!pin) {
      setError('Por favor digita el PIN del empleado.');
      return;
    }

    if (loginWithPin(pin)) {
      navigate('/admin');
    } else {
      setError('PIN no coincide con ningún empleado autorizado activo.');
    }
  };

  const roleLabels: Record<string, { label: string; badge: string; desc: string }> = {
    dueno: { label: 'Dueño / Administrador', badge: 'bg-red-500/20 text-red-300 border-red-500/40', desc: 'Acceso total a reportes, auditoría, caja y configuración' },
    cajero: { label: 'Cajera / Mostrador', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', desc: 'Control de POS mostrador, comandas, mesas, caja y clientes' },
    cocinero: { label: 'Jefe de Cocina / Parrilla', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', desc: 'Pantalla KDS de preparación de comandas' },
    domiciliario: { label: 'Domiciliario / Repartidor', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', desc: 'Despacho de pedidos en camino y entregas' },
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex flex-col justify-center items-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <BrandLogo size="lg" className="justify-center" />
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide mt-3">
            Acceso Administrativo & POS
          </h1>
          <p className="text-xs text-zinc-400">
            Control de operaciones internas de Chaves Burguer
          </p>
        </div>

        {/* Security Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border/70 text-xs text-zinc-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-brand-cream">Seguridad de la Demo Local:</span> Los perfiles están protegidos por PIN numérico para simular los permisos operativos de cada rol.
          </div>
          <button
            onClick={() => setShowDemoPinModal(true)}
            className="text-[11px] font-bold text-brand-orange hover:underline flex items-center gap-1 flex-shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Consultar PINs</span>
          </button>
        </div>

        {/* Employee Cards Selector */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">
              <UserCheck className="w-4 h-4" />
              <span>1. Selecciona tu perfil de empleado:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {staff.map((u) => {
                const info = roleLabels[u.role] || { label: u.role, badge: 'bg-zinc-800 text-zinc-300', desc: '' };
                const isSelected = selectedStaff?.id === u.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedStaff(u);
                      setPin('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-red/15 border-brand-red shadow-glow-red'
                        : 'bg-brand-surface-light border-brand-border hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-brand-cream">{u.name}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-1 ${info.badge}`}>
                          {info.label}
                        </span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1" title="Empleado activo" />
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                      {info.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PIN entry */}
          <form onSubmit={handlePinSubmit} className="pt-4 border-t border-brand-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-cream/80 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-brand-orange" />
                <span>2. Digita el PIN de {selectedStaff?.name || 'acceso'}:</span>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ingresa tu PIN"
                className="flex-1 p-3 rounded-xl bg-brand-surface-light border border-brand-border text-center text-xl font-mono tracking-widest text-brand-cream focus:outline-none focus:border-brand-orange"
              />
              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-bold rounded-xl text-sm shadow-glow-red flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Ingresar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Back to public menu */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-zinc-400 hover:text-brand-orange transition-colors underline"
          >
            ← Volver al Menú Digital de Clientes
          </Link>
        </div>
      </div>

      {/* Modal Guía de PINs para Evaluación Demo */}
      {showDemoPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-brand-cream">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <Info className="w-5 h-5 text-brand-orange" />
              <h3 className="font-bold text-sm">Claves Demo de Evaluación</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Para probar los diferentes niveles de permisos asignados en la demo, utiliza los siguientes códigos:
            </p>
            <div className="space-y-2 text-xs">
              {staff.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStaff(s);
                    setPin(s.pin);
                    setShowDemoPinModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-brand-surface-light border border-brand-border flex items-center justify-between cursor-pointer hover:border-brand-orange transition-colors"
                >
                  <div>
                    <span className="font-bold block">{s.name}</span>
                    <span className="text-[10px] text-zinc-400 capitalize">{s.role}</span>
                  </div>
                  <span className="font-mono font-bold text-brand-orange bg-black/40 px-2 py-1 rounded border border-brand-border">
                    {s.pin}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDemoPinModal(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
