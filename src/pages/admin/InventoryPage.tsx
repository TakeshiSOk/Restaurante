import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { InventoryItem } from '../../types';
import { Boxes, Plus, Minus, AlertTriangle, CheckCircle, Search, RefreshCw, X } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { inventory, adjustInventoryStock, updateInventoryItem, setNotification } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState('');

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;

  const categories = Array.from(new Set(inventory.map((i) => i.category)));

  const filteredInventory = inventory.filter((item) => {
    if (search.trim() && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;

    const qty = parseFloat(restockAmount);
    if (isNaN(qty) || qty <= 0) return;

    adjustInventoryStock(restockItem.id, qty);
    updateInventoryItem(restockItem.id, { lastRestocked: new Date().toISOString() });

    setNotification({
      message: `Entrada registrada: +${qty} ${restockItem.unit} a ${restockItem.name}`,
      type: 'success',
    });

    setRestockItem(null);
    setRestockAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Control de Inventario & Insumos
          </h1>
          <p className="text-xs text-zinc-400">
            Stock de ingredientes, alertas de mínimo y descuento automático por receta
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{lowStockCount} insumo(s) bajo el mínimo</span>
            </span>
          )}
        </div>
      </div>

      {/* Receta automática notice */}
      <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 text-xs text-zinc-300 flex items-start gap-3">
        <Boxes className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Descuento Automático en Venta:</span> Cada vez que se confirma un pedido (en mostrador o web), el sistema descuenta automáticamente las porciones teóricas (ej: carne de hamburguesa, pan ajonjolí, papa francesa congelada) para mantener un control continuo de mermas.
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface p-3.5 rounded-3xl border border-brand-border/70">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo (carne, papa, queso...)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none"
        >
          <option value="all">Todas las categorías ({inventory.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
              <tr>
                <th className="p-3.5">INSUMO / MATERIA PRIMA</th>
                <th className="p-3.5">CATEGORÍA</th>
                <th className="p-3.5 text-center">STOCK ACTUAL</th>
                <th className="p-3.5 text-center">MÍNIMO</th>
                <th className="p-3.5">ESTADO</th>
                <th className="p-3.5">COSTO UNITARIO</th>
                <th className="p-3.5 text-center">AJUSTE RÁPIDO</th>
                <th className="p-3.5 text-center">REABASTECER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {filteredInventory.map((item) => {
                const isLow = item.stock <= item.minStock;

                return (
                  <tr key={item.id} className="hover:bg-brand-surface-light/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-sm text-brand-cream">{item.name}</div>
                      {item.lastRestocked && (
                        <div className="text-[10px] text-zinc-500">
                          Última entrada: {formatDateTime(item.lastRestocked)}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-zinc-300">{item.category}</td>
                    <td className="p-3.5 text-center font-black text-base text-brand-cream">
                      {item.stock} <span className="text-xs font-normal text-zinc-400">{item.unit}</span>
                    </td>
                    <td className="p-3.5 text-center text-zinc-400">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Bajo Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Óptimo</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-zinc-300">
                      {formatCurrency(item.costPerUnit)} / {item.unit}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center border border-brand-border rounded-lg bg-brand-surface-light">
                        <button
                          onClick={() => adjustInventoryStock(item.id, -1)}
                          className="p-1 px-2 text-zinc-400 hover:text-white"
                          title="Restar 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustInventoryStock(item.id, 1)}
                          className="p-1 px-2 text-zinc-400 hover:text-white border-l border-brand-border"
                          title="Sumar 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setRestockItem(item)}
                        className="px-3 py-1 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-lg text-xs transition-colors"
                      >
                        Entrada
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ENTRADA / REABASTECIMIENTO */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleRestockSubmit}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-display text-2xl font-black text-brand-cream">
                  Registrar Entrada
                </h3>
                <p className="text-xs text-zinc-400">{restockItem.name}</p>
              </div>
              <button onClick={() => setRestockItem(null)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">
                Cantidad a ingresar ({restockItem.unit}):
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder={`Ej: 10`}
                className="w-full p-3 rounded-xl bg-brand-surface-light border border-brand-border text-lg font-black text-brand-orange focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
              >
                Confirmar Reabastecimiento
              </button>
              <button
                type="button"
                onClick={() => setRestockItem(null)}
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
