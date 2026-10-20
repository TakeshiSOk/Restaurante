import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ProductImage } from '../../components/common/ProductImage';
import {
  Package,
  Plus,
  Search,
  Check,
  Flame,
  Percent,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Tag,
} from 'lucide-react';

export const ProductsAdminPage: React.FC = () => {
  const {
    products,
    categories,
    toggleProductAvailable,
    toggleProductPopular,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkAdjustPrices,
    setNotification,
    currentUser,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modales
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState<string>('10');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State para producto
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'burgers');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPopular, setFormPopular] = useState(false);

  // Filtrado
  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeCategory !== 'all' && p.categoryId !== activeCategory) return false;
    return true;
  });

  const unpricedProducts = products.filter((p) => p.basePrice === null || p.basePrice === 0);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.id || 'burgers');
    setFormDesc('');
    setFormPrice('');
    setFormPopular(false);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.categoryId);
    setFormDesc(prod.description);
    setFormPrice(prod.basePrice !== null ? String(prod.basePrice) : '');
    setFormPopular(Boolean(prod.popular));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const basePriceNum = formPrice ? parseFloat(formPrice.replace(/\D/g, '')) : null;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        categoryId: formCategory,
        description: formDesc.trim(),
        basePrice: basePriceNum,
        popular: formPopular,
      });
      setNotification({ message: `Producto ${formName} actualizado con éxito.`, type: 'success' });
    } else {
      addProduct({
        name: formName.trim(),
        categoryId: formCategory,
        description: formDesc.trim(),
        basePrice: basePriceNum,
        available: true,
        popular: formPopular,
      });
      setNotification({ message: `Nuevo producto ${formName} agregado al menú.`, type: 'success' });
    }

    setIsProductModalOpen(false);
  };

  const handleApplyBulkPrices = (e: React.FormEvent) => {
    e.preventDefault();
    const percent = parseFloat(bulkPercent);
    if (isNaN(percent)) return;

    bulkAdjustPrices(percent, currentUser?.name || 'Administrador');
    setIsBulkPriceModalOpen(false);
    setNotification({
      message: `¡Precios actualizados en ${percent > 0 ? `+${percent}%` : `${percent}%`} a todos los platos!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Gestión de Menú & Precios
          </h1>
          <p className="text-xs text-zinc-400">
            Catálogo de {products.length} platos, disponibilidad en vivo y actualización de tarifas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="px-3.5 py-2 bg-brand-surface hover:bg-brand-surface-light border border-brand-border text-xs font-bold text-brand-orange rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Percent className="w-4 h-4" />
            <span>Ajuste Masivo (+X%)</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white text-xs font-bold rounded-xl shadow-glow-red flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Plato / Combo</span>
          </button>
        </div>
      </div>

      {/* Alerta de productos sin precio definido */}
      {unpricedProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Aviso del Menú:</span> Hay {unpricedProducts.length} producto(s) con precio por definir ({unpricedProducts.map((p) => p.name).join(', ')}). En el menú público se muestran como "Consultar precio".
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface p-3.5 rounded-3xl border border-brand-border/70">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        {/* Categories selector */}
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="p-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none"
        >
          <option value="all">Todas las categorías ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
              <tr>
                <th className="p-3.5">PLATO / DESCRIPCIÓN</th>
                <th className="p-3.5">CATEGORÍA</th>
                <th className="p-3.5">PRECIO BASE</th>
                <th className="p-3.5 text-center">DESTACADO</th>
                <th className="p-3.5 text-center">DISPONIBLE</th>
                <th className="p-3.5 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-brand-surface-light/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-brand-border shadow-sm bg-zinc-950">
                          <ProductImage
                            product={p}
                            alt={p.name}
                            categoryIcon={cat?.icon}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-brand-cream">{p.name}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-sm mt-0.5">
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-zinc-300">
                      {cat?.icon} {cat?.name}
                    </td>
                    <td className="p-3.5 font-black text-sm">
                      {p.basePrice !== null && p.basePrice > 0 ? (
                        <span className="text-brand-orange">{formatCurrency(p.basePrice)}</span>
                      ) : (
                        <span className="text-amber-400 text-xs italic">Consultar precio</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleProductPopular(p.id)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          p.popular
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-brand-surface border-brand-border text-zinc-600'
                        }`}
                        title="Marcar como popular"
                      >
                        <Flame className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleProductAvailable(p.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          p.available
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/20 border-red-500/40 text-red-300'
                        }`}
                      >
                        {p.available ? 'En Menú' : 'Agotado'}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-brand-surface-light border border-brand-border text-zinc-300 hover:text-white"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar ${p.name}?`)) deleteProduct(p.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJUSTE MASIVO DE PRECIOS CON VISTA PREVIA */}
      {isBulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleApplyBulkPrices}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-brand-cream max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-display text-2xl font-black text-brand-cream">
                  Ajuste Masivo de Precios
                </h3>
                <p className="text-xs text-zinc-400">
                  Previsualiza y aplica un incremento o descuento porcentual con redondeo a $500 COP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">
                Porcentaje de ajuste (%):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="1"
                  required
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  placeholder="10"
                  className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-base font-black text-brand-orange focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Ej: 10 aumenta un 10%, -5 descuenta un 5%. Los platos sin precio ("Consultar precio") no son modificados.
              </span>
            </div>

            {/* Vista Previa de Cambios en Vivo */}
            <div className="space-y-1.5 pt-2 border-t border-brand-border/60">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                <span>Vista Previa de Precios (Muestra de platos):</span>
                <span className="text-brand-orange">
                  {products.filter((p) => p.basePrice !== null).length} platos a actualizar
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto divide-y divide-brand-border/40 border border-brand-border/60 rounded-xl bg-black/40 p-2 text-xs">
                {products
                  .filter((p) => p.basePrice !== null)
                  .slice(0, 8)
                  .map((p) => {
                    const currentP = p.basePrice || 0;
                    const mult = 1 + (parseFloat(bulkPercent) || 0) / 100;
                    const previewP = Math.round((currentP * mult) / 500) * 500;
                    const diff = previewP - currentP;

                    return (
                      <div key={p.id} className="py-1.5 flex justify-between items-center text-[11px]">
                        <span className="truncate max-w-[180px] font-medium">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 line-through">{formatCurrency(currentP)}</span>
                          <span>→</span>
                          <span className="font-bold text-brand-orange">{formatCurrency(previewP)}</span>
                          <span className={`text-[10px] font-semibold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ({diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)})
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Confirmar y Aplicar Ajuste Masivo
              </button>
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveProduct}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-brand-cream max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <h3 className="font-display text-2xl font-black text-brand-cream">
                {editingProduct ? 'Editar Producto' : 'Nuevo Plato'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Nombre del plato *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Salchipapa Salvajada"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Categoría *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Descripción / Ingredientes</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Ej: Papa francesa, pollo, tocineta, maíz y queso..."
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Precio en COP (vacío = por definir)</label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="Ej: 28000"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-sm font-bold text-brand-orange focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="checkPopular"
                checked={formPopular}
                onChange={(e) => setFormPopular(e.target.checked)}
                className="w-4 h-4 rounded bg-brand-surface border-brand-border text-brand-orange"
              />
              <label htmlFor="checkPopular" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Destacar como "Popular / Recomendado de la casa"
              </label>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red"
              >
                Guardar Plato
              </button>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
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
