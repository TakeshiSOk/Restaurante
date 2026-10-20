import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Expense, PaymentMethod } from '../../types';
import { Receipt, Plus, DollarSign, PieChart as PieIcon, Trash2, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, deleteExpense, setNotification, settings } = useAppStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Expense['category']>('proveedores');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('efectivo');

  // Si modo presentación está activo, se oculta la categoría de nómina
  const visibleExpenses = settings?.presentationMode
    ? expenses.filter((e) => e.category !== 'nomina')
    : expenses;

  const totalExpenses = visibleExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Agrupación por categoría
  const categoryTotals: Record<string, number> = {};
  visibleExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const chartData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: total,
  }));

  const COLORS = ['#DC2626', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(/\D/g, '')) || 0;
    if (amountNum <= 0 || !provider.trim() || !description.trim()) return;

    addExpense({
      date: new Date().toISOString(),
      provider: provider.trim(),
      description: description.trim(),
      category,
      amount: amountNum,
      paymentMethod: method,
    });

    setNotification({
      message: `Gasto de ${formatCurrency(amountNum)} registrado correctamente.`,
      type: 'success',
    });

    setIsAddModalOpen(false);
    setProvider('');
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Control de Gastos Operacionales
          </h1>
          <p className="text-xs text-zinc-400">
            Registro de egresos por proveedores, nómina, arriendo y servicios públicos
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-bold rounded-xl text-xs shadow-glow-red flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Gasto</span>
        </button>
      </div>

      {/* Summary Cards and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-2 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Total Gastos Registrados</span>
          <div className="font-black text-3xl text-brand-red-light">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-zinc-500">
            Incluye egresos de caja y transferencias bancarias del período
          </p>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl bg-brand-surface border border-brand-border/70 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Gasto']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full text-xs">
            {chartData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-zinc-400 truncate">{c.name}:</span>
                <span className="font-bold text-brand-cream ml-auto">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-brand-border/60 bg-brand-surface-light">
          <h3 className="font-bold text-sm text-brand-cream">Historial de Compras y Egresos</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
              <tr>
                <th className="p-3.5">FECHA</th>
                <th className="p-3.5">PROVEEDOR / BENEFICIARIO</th>
                <th className="p-3.5">CATEGORÍA</th>
                <th className="p-3.5">DESCRIPCIÓN</th>
                <th className="p-3.5">MÉTODO</th>
                <th className="p-3.5 text-right">VALOR</th>
                <th className="p-3.5 text-center">ELIMINAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {visibleExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-brand-surface-light/40 transition-colors">
                  <td className="p-3.5 text-zinc-400 whitespace-nowrap">{formatDateTime(e.date)}</td>
                  <td className="p-3.5 font-bold text-brand-cream">{e.provider}</td>
                  <td className="p-3.5 capitalize font-medium text-amber-400">{e.category}</td>
                  <td className="p-3.5 text-zinc-300">{e.description}</td>
                  <td className="p-3.5 uppercase font-mono text-[10px] text-zinc-400">{e.paymentMethod}</td>
                  <td className="p-3.5 text-right font-black text-brand-red-light">
                    -{formatCurrency(e.amount)}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar este registro de gasto?')) deleteExpense(e.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO GASTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateExpense}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <h3 className="font-display text-2xl font-black text-brand-cream">
                Registrar Gasto
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Proveedor / Destinatario *</label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Ej: Distribuidora de Carnes / Efigas"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Categoría *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none"
              >
                <option value="proveedores">Proveedores de Alimentos</option>
                <option value="servicios">Servicios Públicos (Gas, Agua, Luz)</option>
                {!settings?.presentationMode && <option value="nomina">Nómina / Sueldos</option>}
                <option value="arriendo">Arriendo de Local</option>
                <option value="mantenimiento">Mantenimiento de Equipos</option>
                <option value="otros">Otros Gastos Varios</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Concepto / Detalle *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra semanal de costilla y tocineta"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Monto en COP *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ej: 180000"
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-sm font-bold text-brand-orange focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Medio de Pago</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none"
                >
                  <option value="efectivo">Efectivo (Sale de caja)</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red"
              >
                Guardar Gasto
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
