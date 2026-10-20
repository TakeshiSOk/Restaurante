import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  User,
  Crown,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Staff } from '../../types';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { staff, loginAsStaff, settings, setNotification } = useAppStore();

  // Campos visuales de login
  const [emailOrPhone, setEmailOrPhone] = useState('admin@chavesburguer.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Selector desplegable de roles secundarios (Cajera, Cocinero, Domiciliario)
  const [showOtherRoles, setShowOtherRoles] = useState(false);

  // 1. Acción: Entrar como Super Admin (Dueño)
  const handleSuperAdminLogin = () => {
    const owner = staff.find((s) => s.role === 'dueno') || staff[0];
    if (owner) {
      loginAsStaff(owner.id);
      setNotification({
        message: `¡Bienvenido Super Administrador (${owner.name})! Acceso total concedido.`,
        type: 'success',
      });
      navigate('/admin');
    }
  };

  // 2. Acción: Entrar como Invitado (Menú Digital de Clientes)
  const handleGuestLogin = () => {
    setNotification({
      message: 'Navegando como Invitado / Cliente. ¡Explora el menú y realiza tus pedidos!',
      type: 'info',
    });
    navigate('/');
  };

  // 3. Acción al presionar el botón "Iniciar Sesión" del formulario visual
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Inicia sesión como el Super Administrador por defecto
    handleSuperAdminLogin();
  };

  // 4. Acción: Entrar con un rol específico de empleado (Cajero, Cocina, Domiciliario)
  const handleRoleLogin = (member: Staff) => {
    loginAsStaff(member.id);
    setNotification({
      message: `Sesión iniciada como: ${member.name} (${member.role.toUpperCase()})`,
      type: 'info',
    });

    if (member.role === 'cocinero') {
      navigate('/admin/cocina');
    } else if (member.role === 'domiciliario') {
      navigate('/admin/domicilios');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Luces y resplandores de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10 animate-fade-in">
        {/* Cabecera con Logo */}
        <div className="text-center space-y-2">
          <BrandLogo size="lg" className="justify-center mx-auto" />
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide mt-2">
            Portal de Acceso
          </h1>
          <p className="text-xs text-zinc-400">
            {settings.name} · Sistema de Gestión y Ventas
          </p>
        </div>

        {/* Tarjeta Principal de Login */}
        <div className="bg-brand-surface/95 backdrop-blur-xl border border-brand-border/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Formulario Visual */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                Correo Electrónico o Celular
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="ejemplo@correo.com o celular"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Contraseña o PIN
                </label>
                <span className="text-[11px] text-brand-orange hover:underline cursor-pointer">
                  ¿Olvidaste tu clave?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-orange bg-brand-surface border-brand-border focus:ring-brand-orange"
                />
                <span>Recordar sesión</span>
              </label>
            </div>

            {/* Botón Iniciar Sesión General */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow-red transition-all active:scale-95"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Separador Visual */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-brand-border/60 w-full" />
            <span className="bg-brand-surface px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
              O elige acceso directo a la demo
            </span>
            <div className="border-t border-brand-border/60 w-full" />
          </div>

          {/* 2 BOTONES DESTACADOS: SUPER ADMIN vs INVITADO */}
          <div className="space-y-2.5 pt-1">
            {/* BOTÓN 1: ENTRAR COMO SUPER ADMIN */}
            <button
              type="button"
              onClick={handleSuperAdminLogin}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-brand-surface-light to-amber-950/40 border border-brand-orange/60 hover:border-brand-orange text-left flex items-center justify-between group transition-all shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-brand-orange text-white flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="font-display font-black text-sm text-brand-cream group-hover:text-brand-orange transition-colors flex items-center gap-1.5">
                    <span>Entrar como Super Admin</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
                      Dueño
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Acceso total: POS, cocina, caja, reportes y domicilios
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* BOTÓN 2: ENTRAR COMO INVITADO */}
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full p-3.5 rounded-2xl bg-brand-surface-light hover:bg-zinc-800/80 border border-brand-border hover:border-zinc-500 text-left flex items-center justify-between group transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-brand-orange flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-brand-cream group-hover:text-white transition-colors flex items-center gap-1.5">
                    <span>Entrar como Invitado</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Cliente
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Ver Menú Digital, agregar al carrito y pedir
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>

          {/* Desplegable Opcional: Probar Otros Roles de Empleados */}
          <div className="pt-2 border-t border-brand-border/50 text-xs">
            <button
              type="button"
              onClick={() => setShowOtherRoles(!showOtherRoles)}
              className="w-full py-1.5 text-zinc-400 hover:text-zinc-200 flex items-center justify-between font-semibold transition-colors text-[11px]"
            >
              <span>¿Quieres probar otros roles de empleados?</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOtherRoles ? 'rotate-180 text-brand-orange' : ''}`} />
            </button>

            {showOtherRoles && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 animate-fade-in">
                {staff
                  .filter((s) => s.role !== 'dueno' && s.role !== 'cliente')
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleRoleLogin(m)}
                      className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-orange/60 text-left transition-all hover:bg-zinc-900 group"
                    >
                      <span className="font-bold text-brand-cream block truncate text-[11px] group-hover:text-brand-orange">
                        {m.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-zinc-400 capitalize block">
                        {m.role}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer simple con enlace de retorno */}
        <div className="text-center text-xs text-zinc-500">
          <p>Plataforma comercial demostrativa para restaurantes de comida rápida.</p>
        </div>
      </div>
    </div>
  );
};
