import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../lib/utils';
import { Customer, PaymentMethod } from '../../types';
import { Users, Search, Plus, Award, MessageCircle, Phone, MapPin, X, DollarSign, CheckCircle } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer, recordCreditPayment, currentUser, settings, setNotification } = useAppStore();

  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Fiado Abono Modal
  const [abonoCustomer, setAbonoCustomer] = useState<Customer | null>(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoMethod, setAbonoMethod] = useState<PaymentMethod>('efectivo');

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      (c.address && c.address.toLowerCase().includes(query))
    );
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setNotification({
      message: `Cliente ${newName} registrado con éxito.`,
      type: 'success',
    });

    setIsNewModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewNotes('');
  };

  const handleAbonoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abonoCustomer) return;
    const amountNum = parseFloat(abonoAmount.replace(/\D/g, '')) || 0;
    if (amountNum <= 0) {
      alert('Ingresa un monto válido para el abono.');
      return;
    }

    recordCreditPayment(abonoCustomer.id, amountNum, abonoMethod, currentUser?.name || 'Cajero');
    setNotification({
      message: `Abono de ${formatCurrency(amountNum)} registrado para ${abonoCustomer.name}`,
      type: 'success',
    });
    setAbonoCustomer(null);
    setAbonoAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Fidelización & Clientes
          </h1>
          <p className="text-xs text-zinc-400">
            Directorio de {customers.length} clientes, puntos acumulados y saldo fiado
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-bold rounded-xl text-xs shadow-glow-red flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative bg-brand-surface p-3 rounded-2xl border border-brand-border/70">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o dirección..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
        />
      </div>

      {/* Customers Grid / Table */}
      <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-surface-light border-b border-brand-border/60 text-zinc-400">
              <tr>
                <th className="p-3.5">CLIENTE</th>
                <th className="p-3.5">CONTACTO</th>
                <th className="p-3.5 text-center">PEDIDOS</th>
                <th className="p-3.5">TOTAL CONSUMIDO</th>
                {!settings?.presentationMode && <th className="p-3.5">PUNTOS CHAVES</th>}
                <th className="p-3.5">SALDO FIADO</th>
                <th className="p-3.5 text-center">WHATSAPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-brand-surface-light/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-sm text-brand-cream">{c.name}</div>
                    {c.notes && <div className="text-[10px] text-amber-300 italic">{c.notes}</div>}
                  </td>
                  <td className="p-3.5 text-zinc-300 space-y-0.5">
                    <div>{c.phone}</div>
                    {c.address && (
                      <div className="text-[10px] text-zinc-400 line-clamp-1">📍 {c.address}</div>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-bold text-zinc-300">{c.totalOrders}</td>
                  <td className="p-3.5 font-bold text-brand-cream">{formatCurrency(c.totalSpent)}</td>
                  {!settings?.presentationMode && (
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        <Award className="w-3.5 h-3.5" />
                        <span>{c.loyaltyPoints} pts</span>
                      </span>
                    </td>
                  )}
                  <td className="p-3.5">
                    {c.creditBalance > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-black text-brand-red-light">
                          {formatCurrency(c.creditBalance)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAbonoCustomer(c);
                            setAbonoAmount(String(c.creditBalance));
                          }}
                          className="px-2 py-0.5 rounded-lg bg-brand-orange/20 hover:bg-brand-orange text-brand-orange hover:text-white border border-brand-orange/40 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                          title="Registrar abono a saldo fiado"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Abonar</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500">Al día ($0)</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <a
                      href={`https://wa.me/57${c.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(c.name)},%20te%20saludamos%20desde%20Chaves%20Burguer.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 transition-colors"
                      title="Escribir por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO CLIENTE */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <h3 className="font-display text-2xl font-black text-brand-cream">
                Nuevo Cliente
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Nombre Completo *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Mauricio Betancur"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Teléfono Celular *</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ej: 310 123 4567"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Dirección habitual</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Ej: Calle 16 # 7-19"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Notas / Autorizaciones</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ej: Cliente frecuente / Fiado autorizado"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl text-xs shadow-glow-red"
              >
                Guardar Cliente
              </button>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Modal Registrar Abono al Fiado */}
      {abonoCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAbonoSubmit}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="font-display text-xl font-black text-brand-cream">
                  Abono a Saldo Fiado
                </h3>
                <p className="text-xs text-zinc-400">Cliente: <span className="font-bold text-brand-orange">{abonoCustomer.name}</span></p>
              </div>
              <button
                type="button"
                onClick={() => setAbonoCustomer(null)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Saldo Pendiente Actual:</span>
                <span className="font-black text-brand-red-light">{formatCurrency(abonoCustomer.creditBalance)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Monto a Abonar (COP) *</label>
              <input
                type="number"
                required
                autoFocus
                min={1}
                max={abonoCustomer.creditBalance}
                value={abonoAmount}
                onChange={(e) => setAbonoAmount(e.target.value)}
                placeholder="Ej: 20000"
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Método de Pago</label>
              <select
                value={abonoMethod}
                onChange={(e) => setAbonoMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none focus:border-brand-orange"
              >
                <option value="efectivo" className="bg-zinc-900">💵 Efectivo (Suma en Caja)</option>
                <option value="nequi" className="bg-zinc-900">🟣 Nequi</option>
                <option value="daviplata" className="bg-zinc-900">🔴 Daviplata</option>
                <option value="transferencia" className="bg-zinc-900">🏦 Transferencia Bancaria</option>
                <option value="tarjeta" className="bg-zinc-900">💳 Tarjeta Débito / Crédito</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar Abono</span>
              </button>
              <button
                type="button"
                onClick={() => setAbonoCustomer(null)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
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
