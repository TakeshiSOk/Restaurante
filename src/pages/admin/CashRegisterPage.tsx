import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { CashSession, PaymentMethod } from '../../types';
import {
  Banknote,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Lock,
  Unlock,
  Printer,
  History,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export const CashRegisterPage: React.FC = () => {
  const { cashSessions, openCashSession, addCashMovement, closeCashSession, currentUser, setNotification } =
    useAppStore();

  const currentSession = cashSessions.find((s) => s.status === 'abierta');
  const pastSessions = cashSessions.filter((s) => s.status === 'cerrada');

  // Modales
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [initialFloatInput, setInitialFloatInput] = useState('150000');

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'ingreso' | 'egreso'>('egreso');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');

  // Contador de billetes para el arqueo
  const [denominations, setDenominations] = useState<Record<number, number>>({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
  });

  const totalCountedCash = Object.entries(denominations).reduce(
    (sum, [denom, count]) => sum + parseInt(denom, 10) * count,
    0
  );

  // Cálculos de la sesión actual
  const movements = currentSession?.movements || [];
  const cashIn = movements
    .filter((m) => m.method === 'efectivo' && (m.type === 'ingreso' || m.type === 'venta'))
    .reduce((sum, m) => sum + m.amount, 0);
  const cashOut = movements
    .filter((m) => m.method === 'efectivo' && m.type === 'egreso')
    .reduce((sum, m) => sum + m.amount, 0);

  const electronicIn = movements
    .filter((m) => m.method !== 'efectivo' && m.type === 'venta')
    .reduce((sum, m) => sum + m.amount, 0);

  const expectedCash = cashIn - cashOut;
  const cashDiff = totalCountedCash - expectedCash;

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const floatNum = parseFloat(initialFloatInput.replace(/\D/g, '')) || 0;
    openCashSession(currentUser?.name || 'Administrador', floatNum);
    setIsOpenShiftModalOpen(false);
    setNotification({
      message: `¡Caja abierta exitosamente con base de ${formatCurrency(floatNum)}!`,
      type: 'success',
    });
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(movementAmount.replace(/\D/g, '')) || 0;
    if (amountNum <= 0 || !movementReason.trim()) {
      alert('Por favor ingresa un monto válido y el motivo.');
      return;
    }

    addCashMovement({
      type: movementType,
      amount: amountNum,
      method: 'efectivo',
      reason: movementReason.trim(),
      cashierName: currentUser?.name || 'Cajero',
    });

    setIsMovementModalOpen(false);
    setMovementAmount('');
    setMovementReason('');
    setNotification({
      message: `Movimiento de ${movementType} (${formatCurrency(amountNum)}) registrado.`,
      type: 'info',
    });
  };

  const handleCloseShift = () => {
    if (!currentSession) return;
    closeCashSession(totalCountedCash, currentUser?.name || 'Cajero', closeNotes);
    setIsCloseModalOpen(false);
    setNotification({
      message: `Turno cerrado. Arqueo final: ${formatCurrency(totalCountedCash)}`,
      type: 'warning',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Control de Caja & Turnos
          </h1>
          <p className="text-xs text-zinc-400">
            Apertura de turno, movimientos de efectivo, transferencias y arqueo de cierre
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentSession ? (
            <>
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="px-3.5 py-2 bg-brand-surface hover:bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold text-brand-cream flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-orange" />
                <span>Registrar Entrada / Salida</span>
              </button>
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Turno & Arqueo</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-glow-red transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Nuevo Turno de Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* Estado de Turno Actual */}
      {currentSession ? (
        <div className="space-y-4">
          {/* Tarjetas de Resumen de Caja */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-1">
              <span className="text-xs text-zinc-400">Base de Apertura</span>
              <div className="font-black text-xl text-brand-cream">
                {formatCurrency(currentSession.initialFloat)}
              </div>
              <p className="text-[10px] text-zinc-500">
                Por {currentSession.openedBy} ({formatDateTime(currentSession.openedAt)})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-1">
              <span className="text-xs text-zinc-400">Total Ingresos Efectivo</span>
              <div className="font-black text-xl text-emerald-400">
                {formatCurrency(cashIn)}
              </div>
              <p className="text-[10px] text-zinc-500">Base inicial + ventas en efectivo</p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-1">
              <span className="text-xs text-zinc-400">Egresos / Gastos Caja</span>
              <div className="font-black text-xl text-red-400">
                -{formatCurrency(cashOut)}
              </div>
              <p className="text-[10px] text-zinc-500">Salidas de efectivo menores</p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-orange/40 bg-brand-orange/5 space-y-1">
              <span className="text-xs text-brand-orange font-bold">Efectivo Esperado en Gaveta</span>
              <div className="font-black text-2xl text-brand-orange">
                {formatCurrency(expectedCash)}
              </div>
              <p className="text-[10px] text-zinc-400">Saldo teórico que debe haber</p>
            </div>
          </div>

          {/* Historial de Movimientos del Turno */}
          <div className="bg-brand-surface border border-brand-border/70 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-bold text-sm text-brand-cream">Movimientos del Turno</h3>
                <p className="text-xs text-zinc-400">Auditoría completa de transacciones</p>
              </div>
              <span className="text-xs bg-brand-surface-light border border-brand-border px-2.5 py-1 rounded-full text-zinc-300">
                {movements.length} movimientos
              </span>
            </div>

            <div className="divide-y divide-brand-border/40 max-h-96 overflow-y-auto">
              {movements.map((mov) => {
                const isPositive = mov.type === 'ingreso' || mov.type === 'venta';
                return (
                  <div key={mov.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          isPositive
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/15 border-red-500/30 text-red-400'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-brand-cream">{mov.reason}</div>
                        <div className="text-[10px] text-zinc-400">
                          {formatDateTime(mov.timestamp)} · Método: <span className="uppercase">{mov.method}</span> · Atendió: {mov.cashierName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : '-'}{formatCurrency(mov.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center space-y-4 bg-brand-surface border border-brand-border/70 rounded-3xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-brand-cream">Caja Cerrada</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            No hay ningún turno activo en este momento. Abre un nuevo turno para poder registrar ventas y cobros en efectivo.
          </p>
          <button
            onClick={() => setIsOpenShiftModalOpen(true)}
            className="px-4 py-2.5 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
          >
            Abrir Turno con Base
          </button>
        </div>
      )}

      {/* Historial de Cierres de Turno Anteriores */}
      <div className="bg-brand-surface border border-brand-border/70 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-orange uppercase">
          <History className="w-4 h-4" />
          <span>Historial de Cierres Anteriores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
              <tr>
                <th className="p-3">APERTURA</th>
                <th className="p-3">CIERRE</th>
                <th className="p-3">CAJERO</th>
                <th className="p-3">BASE</th>
                <th className="p-3">ESPERADO</th>
                <th className="p-3">CONTADO</th>
                <th className="p-3">DIFERENCIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {pastSessions.slice(0, 5).map((s) => {
                const diff = s.difference || 0;
                return (
                  <tr key={s.id} className="hover:bg-brand-surface-light/40 transition-colors">
                    <td className="p-3">{formatDateTime(s.openedAt)}</td>
                    <td className="p-3">{s.closedAt ? formatDateTime(s.closedAt) : '-'}</td>
                    <td className="p-3 font-semibold">{s.closedBy || s.openedBy}</td>
                    <td className="p-3">{formatCurrency(s.initialFloat)}</td>
                    <td className="p-3">{formatCurrency(s.expectedCash ?? 0)}</td>
                    <td className="p-3 font-bold text-brand-cream">{formatCurrency(s.countedCash ?? 0)}</td>
                    <td className="p-3">
                      <span
                        className={`font-bold ${
                          diff === 0 ? 'text-emerald-400' : diff > 0 ? 'text-blue-400' : 'text-red-400'
                        }`}
                      >
                        {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL APERTURA DE TURNO */}
      {isOpenShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleOpenShift}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <h3 className="font-display text-2xl font-black text-brand-cream">Apertura de Turno</h3>
            <p className="text-xs text-zinc-400">
              Ingresa el valor del efectivo que se deja como base en la gaveta.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Base de Apertura (COP):</label>
              <input
                type="number"
                required
                value={initialFloatInput}
                onChange={(e) => setInitialFloatInput(e.target.value)}
                placeholder="150000"
                className="w-full p-3 rounded-xl bg-brand-surface-light border border-brand-border text-lg font-black text-brand-orange focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red"
              >
                Confirmar Apertura
              </button>
              <button
                type="button"
                onClick={() => setIsOpenShiftModalOpen(false)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL MOVIMIENTO MANUAL */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAddMovement}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <h3 className="font-display text-2xl font-black text-brand-cream">Movimiento de Caja</h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('egreso')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                  movementType === 'egreso'
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-brand-surface-light border-brand-border text-zinc-400'
                }`}
              >
                Salida de Efectivo (Egreso)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('ingreso')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                  movementType === 'ingreso'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-brand-surface-light border-brand-border text-zinc-400'
                }`}
              >
                Entrada de Efectivo (Ingreso)
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Monto (COP):</label>
              <input
                type="number"
                required
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                placeholder="Ej: 20000"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-sm text-brand-cream focus:outline-none focus:border-brand-orange font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Motivo / Justificación:</label>
              <input
                type="text"
                required
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                placeholder="Ej: Compra de bolsas / Pago domiciliario de turno"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
              >
                Guardar Movimiento
              </button>
              <button
                type="button"
                onClick={() => setIsMovementModalOpen(false)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CIERRE DE TURNO & ARQUEO DE BILLETES */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-brand-cream max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-display text-2xl font-black text-brand-cream">
                  Arqueo y Cierre de Turno
                </h3>
                <p className="text-xs text-zinc-400">Cuenta las denominaciones en gaveta</p>
              </div>
              <button onClick={() => setIsCloseModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Billetes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-orange uppercase block">
                Conteo por Denominación
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.keys(denominations)
                  .map(Number)
                  .sort((a, b) => b - a)
                  .map((denom) => (
                    <div
                      key={denom}
                      className="flex items-center justify-between p-2 rounded-xl bg-brand-surface-light border border-brand-border"
                    >
                      <span className="font-bold">${denom.toLocaleString('es-CO')}</span>
                      <input
                        type="number"
                        min="0"
                        value={denominations[denom] || ''}
                        onChange={(e) =>
                          setDenominations({
                            ...denominations,
                            [denom]: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        placeholder="0"
                        className="w-16 p-1 rounded bg-brand-surface border border-brand-border text-right text-xs font-bold"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Cuadre & Diferencia */}
            <div className="p-4 rounded-2xl bg-black/40 border border-brand-border space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Efectivo Físico Contado:</span>
                <span className="font-black text-brand-cream text-sm">{formatCurrency(totalCountedCash)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Efectivo Esperado según sistema:</span>
                <span className="font-semibold text-zinc-300">{formatCurrency(expectedCash)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-brand-border text-sm font-bold">
                <span>Diferencia (Cuadre):</span>
                <span
                  className={
                    cashDiff === 0
                      ? 'text-emerald-400'
                      : cashDiff > 0
                      ? 'text-blue-400'
                      : 'text-red-400 font-black'
                  }
                >
                  {cashDiff === 0 ? 'Exacto ($0)' : cashDiff > 0 ? `Sobrante: +${formatCurrency(cashDiff)}` : `Faltante: ${formatCurrency(cashDiff)}`}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Notas de Cierre:</label>
              <textarea
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="Observaciones de caja para el dueño..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCloseShift}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Cerrar Turno Definitivamente
              </button>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
