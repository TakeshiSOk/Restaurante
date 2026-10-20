import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TableAccount, Customer, PaymentMethod } from '../../types';
import { formatCurrency, formatTime, formatDateTime, playAlertSound, calculateChange } from '../../lib/utils';
import { ThermalReceipt } from '../../components/common/ThermalReceipt';
import {
  UtensilsCrossed,
  Users,
  CreditCard,
  Plus,
  CheckCircle,
  MessageCircle,
  DollarSign,
  Printer,
  X,
  FileText,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  Banknote,
  RotateCcw,
} from 'lucide-react';

export const TablesAndAccountsPage: React.FC = () => {
  const {
    tables,
    orders,
    updateTableStatus,
    releaseTable,
    updateOrderStatus,
    cancelOrder,
    addCashMovement,
    customers,
    recordCreditPayment,
    setNotification,
    currentUser,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'tables' | 'fiado'>('tables');
  const [selectedTable, setSelectedTable] = useState<TableAccount | null>(null);

  // Estado de Cobro y Liquidación de Mesa
  const [isSettlingPayment, setIsSettlingPayment] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('efectivo');
  const [settlementTendered, setSettlementTendered] = useState<string>('');
  const [showPreReceipt, setShowPreReceipt] = useState(false);

  // Fiado Abono Modal
  const [abonoCustomer, setAbonoCustomer] = useState<Customer | null>(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoMethod, setAbonoMethod] = useState<PaymentMethod>('efectivo');

  // Clientes con saldo pendiente de fiado
  const creditCustomers = customers.filter((c) => c.creditBalance > 0);
  const totalCreditOutstanding = creditCustomers.reduce((acc, c) => acc + c.creditBalance, 0);

  // Pedido asociado a la mesa seleccionada
  const currentTableOrder = selectedTable?.currentOrderId
    ? orders.find((o) => o.id === selectedTable.currentOrderId)
    : null;

  const handleOpenTable = (tableId: string) => {
    updateTableStatus(tableId, 'ocupada', undefined, 2);
    setNotification({
      message: 'Mesa abierta y disponible para comandas.',
      type: 'info',
    });
  };

  const handleAskBill = (tableId: string) => {
    updateTableStatus(tableId, 'cuenta_pedida');
    setNotification({
      message: 'Mesa marcada con cuenta solicitada.',
      type: 'warning',
    });
  };

  const handleStartSettlement = () => {
    if (!currentTableOrder) return;
    setSettlementTendered(String(currentTableOrder.total));
    setIsSettlingPayment(true);
  };

  const handleConfirmTablePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !currentTableOrder) return;

    const total = currentTableOrder.total;
    const tenderedNum = parseFloat(settlementTendered.replace(/\D/g, '')) || total;

    if (settlementMethod === 'efectivo' && tenderedNum < total) {
      alert(`El monto entregado (${formatCurrency(tenderedNum)}) es menor al total a pagar (${formatCurrency(total)}).`);
      return;
    }

    // Si es efectivo y hay caja abierta, registrar movimiento de venta
    if (settlementMethod === 'efectivo') {
      addCashMovement({
        type: 'venta',
        amount: total,
        method: 'efectivo',
        reason: `Cobro Mesa #${selectedTable.tableNumber} - Pedido ${currentTableOrder.code}`,
        cashierName: currentUser?.name || 'Mesero / Cajero',
        orderId: currentTableOrder.id,
      });
    }

    // Marcar pedido como entregado / liquidado
    updateOrderStatus(
      currentTableOrder.id,
      'entregado',
      `Cuenta cobrada en Mesa #${selectedTable.tableNumber} vía ${settlementMethod}`
    );

    // Liberar mesa
    releaseTable(selectedTable.id);

    playAlertSound('success');
    setNotification({
      message: `Mesa #${selectedTable.tableNumber} liquidada con éxito (${formatCurrency(total)}) y liberada.`,
      type: 'success',
    });

    setSelectedTable(null);
    setIsSettlingPayment(false);
    setSettlementTendered('');
  };

  const handleCancelTableOrder = () => {
    if (!selectedTable || !currentTableOrder) return;
    const confirmCancel = window.confirm(
      `¿Seguro que deseas anular la comanda ${currentTableOrder.code} y liberar la Mesa #${selectedTable.tableNumber}?`
    );
    if (!confirmCancel) return;

    cancelOrder(currentTableOrder.id, 'Comanda anulada desde gestión de mesas', currentUser?.name || 'Administrador');
    releaseTable(selectedTable.id);
    setNotification({
      message: `Comanda ${currentTableOrder.code} anulada y Mesa #${selectedTable.tableNumber} liberada.`,
      type: 'warning',
    });
    setSelectedTable(null);
  };

  const handleReleaseEmptyTable = (tableId: string) => {
    releaseTable(tableId);
    setSelectedTable(null);
    setNotification({
      message: 'Mesa liberada y marcada como disponible.',
      type: 'success',
    });
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

  // Cálculo de cambio para cobro de mesa
  const settlementTenderedNum = parseFloat(settlementTendered.replace(/\D/g, '')) || 0;
  const settlementChange = currentTableOrder
    ? calculateChange(currentTableOrder.total, settlementTenderedNum)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Mesas & Cuentas Abiertas
          </h1>
          <p className="text-xs text-zinc-400">
            Control de mesas en salón, liquidación de comandas y cartera de clientes fiados
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-brand-surface rounded-2xl border border-brand-border">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Mapa de Mesas ({tables.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fiado')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'fiado'
                ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fiados ({creditCustomers.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'tables' ? (
        /* MAPA DE MESAS */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-brand-surface p-3 rounded-2xl border border-brand-border/60">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Disponible
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" /> Ocupada / En consumo
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" /> Cuenta Pedida
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 italic">
              Toca una mesa para ver su comanda, imprimir pre-cuenta o liquidar pago.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {tables.map((t) => {
              const isOccupied = t.status === 'ocupada';
              const isBillRequested = t.status === 'cuenta_pedida';

              let statusColor = 'border-emerald-500/30 bg-brand-surface hover:border-emerald-500';
              if (isOccupied) statusColor = 'border-amber-500/60 bg-amber-500/10 hover:border-amber-400';
              if (isBillRequested) statusColor = 'border-red-500/60 bg-red-500/15 hover:border-red-400 animate-pulse';

              const tableOrder = t.currentOrderId ? orders.find((o) => o.id === t.currentOrderId) : null;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTable(t);
                    setIsSettlingPayment(false);
                  }}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all active:scale-95 flex flex-col justify-between min-h-[145px] shadow-sm ${statusColor}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-display text-2xl font-black text-brand-cream">
                      #{t.tableNumber}
                    </span>
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isBillRequested ? 'bg-red-500 shadow-red-500/50' : isOccupied ? 'bg-amber-400 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/50'
                      }`}
                    />
                  </div>

                  <div className="mt-2 text-xs">
                    {tableOrder ? (
                      <div>
                        <span className="font-bold text-brand-orange block text-sm">
                          {formatCurrency(tableOrder.total)}
                        </span>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {tableOrder.items.length} producto(s) · {tableOrder.code}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold">Libre</span>
                    )}
                  </div>

                  <div className="mt-2 pt-1 border-t border-brand-border/40 text-[10px] text-zinc-400 capitalize font-medium">
                    {t.status.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GESTIÓN DE FIADOS */
        <div className="space-y-4">
          {/* Banner de Total Fiado */}
          <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs text-zinc-400">Total en Cartera de Clientes (Fiado):</span>
              <div className="font-black text-3xl text-amber-400 mt-0.5">
                {formatCurrency(totalCreditOutstanding)}
              </div>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              Saldos acumulados autorizados a clientes de confianza. Cada abono entra directamente a la caja activa.
            </p>
          </div>

          {/* Directorio de Cuentas por Cobrar */}
          <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-brand-border/60 bg-brand-surface-light">
              <h3 className="font-bold text-sm text-brand-cream">Clientes con Saldo Pendiente</h3>
            </div>

            <div className="divide-y divide-brand-border/40">
              {creditCustomers.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No hay clientes con saldos pendientes por cobrar en este momento.
                </div>
              ) : (
                creditCustomers.map((cust) => (
                  <div key={cust.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-base text-brand-cream">{cust.name}</div>
                      <div className="text-zinc-400 mt-0.5">
                        Tel: {cust.phone} {cust.address && `· Dir: ${cust.address}`}
                      </div>
                      {cust.notes && <div className="text-amber-300 italic mt-0.5">Nota: {cust.notes}</div>}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Saldo a pagar:</span>
                        <span className="font-black text-base text-brand-red-light">
                          {formatCurrency(cust.creditBalance)}
                        </span>
                      </div>

                      <a
                        href={`https://wa.me/57${cust.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(cust.name)},%20te%20saludamos%20de%20Chaves%20Burguer.%20Tu%20saldo%20actual%20en%20cuenta%20es%20de%20${encodeURIComponent(formatCurrency(cust.creditBalance))}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 transition-colors"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => setAbonoCustomer(cust)}
                        className="px-3.5 py-2 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-xl transition-colors shadow-sm"
                      >
                        Registrar Abono
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE / LIQUIDACIÓN DE MESA */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-brand-cream max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <span className="text-xs text-zinc-400">Detalle de Salón</span>
                <h3 className="font-display text-2xl font-black text-brand-cream flex items-center gap-2">
                  Mesa #{selectedTable.tableNumber}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      selectedTable.status === 'cuenta_pedida'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : selectedTable.status === 'ocupada'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {selectedTable.status.replace('_', ' ')}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setIsSettlingPayment(false);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-brand-surface-light border border-brand-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentTableOrder ? (
              isSettlingPayment ? (
                /* VISTA DE LIQUIDACIÓN Y PAGO */
                <form onSubmit={handleConfirmTablePayment} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-brand-surface-light border border-brand-border flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Total a Cobrar:</span>
                      <span className="font-mono font-black text-2xl text-brand-orange">
                        {formatCurrency(currentTableOrder.total)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400 block text-[11px]">Comanda:</span>
                      <span className="font-mono font-bold text-white">{currentTableOrder.code}</span>
                    </div>
                  </div>

                  {/* Selector de Método de Pago */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300 block">Método de Pago:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'efectivo' as const, label: '💵 Efectivo' },
                        { id: 'nequi' as const, label: '📱 Nequi' },
                        { id: 'daviplata' as const, label: '📱 Daviplata' },
                        { id: 'tarjeta' as const, label: '💳 Tarjeta' },
                        { id: 'transferencia' as const, label: '🏦 Bancolombia' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSettlementMethod(m.id)}
                          className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
                            settlementMethod === m.id
                              ? 'bg-brand-red border-brand-red text-white shadow-sm'
                              : 'bg-brand-surface-light border-brand-border text-zinc-300 hover:border-zinc-500'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Efectivo: Paga con y Cambio */}
                  {settlementMethod === 'efectivo' && (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-brand-border">
                      <label className="font-bold text-zinc-300 block">Efectivo Entregado por el Cliente:</label>
                      <input
                        type="number"
                        required
                        min={currentTableOrder.total}
                        value={settlementTendered}
                        onChange={(e) => setSettlementTendered(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-brand-surface border border-brand-border text-base font-black text-brand-orange focus:outline-none focus:border-brand-orange"
                      />

                      {/* Botones de denominaciones rápidas */}
                      <div className="flex gap-1.5 pt-1">
                        {[currentTableOrder.total, 20000, 50000, 100000].map((quickVal) => (
                          <button
                            key={quickVal}
                            type="button"
                            onClick={() => setSettlementTendered(String(quickVal))}
                            className="flex-1 py-1 px-2 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700 transition-colors"
                          >
                            {formatCurrency(quickVal)}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-brand-border/40 text-xs">
                        <span className="text-zinc-400">Devuelta / Cambio:</span>
                        <span className="font-black text-base text-emerald-400">
                          {formatCurrency(settlementChange)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirmar Pago y Liberar Mesa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSettlingPayment(false)}
                      className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
                    >
                      Atrás
                    </button>
                  </div>
                </form>
              ) : (
                /* VISTA REGULAR DE COMANDA EN MESA */
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-2xl bg-black/40 border border-brand-border space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Comanda:</span>
                      <span className="font-mono font-bold text-brand-orange">{currentTableOrder.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Hora de apertura:</span>
                      <span>{formatTime(currentTableOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Estado de preparación:</span>
                      <span className="uppercase font-bold text-amber-300">{currentTableOrder.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-brand-orange uppercase block text-[11px] tracking-wider">
                      Consumo en Mesa:
                    </span>
                    <div className="divide-y divide-brand-border/40 max-h-48 overflow-y-auto pr-1">
                      {currentTableOrder.items.map((i, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-start gap-2">
                          <div>
                            <div className="font-bold text-brand-cream">
                              {i.quantity}x {i.name}
                            </div>
                            {i.variantName && (
                              <div className="text-[10px] text-zinc-400">Opción: {i.variantName}</div>
                            )}
                            {i.addons && i.addons.length > 0 && (
                              <div className="text-[10px] text-amber-300">
                                ➕ {i.addons.map((a) => a.name).join(', ')}
                              </div>
                            )}
                            {i.notes && (
                              <div className="text-[10px] text-red-300 italic">Nota: {i.notes}</div>
                            )}
                          </div>
                          <span className="font-bold text-white whitespace-nowrap">
                            {formatCurrency(i.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between font-black text-sm pt-2.5 border-t border-brand-border">
                      <span>Total Acumulado:</span>
                      <span className="text-brand-orange text-base">
                        {formatCurrency(currentTableOrder.total)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowPreReceipt(true)}
                      className="py-2.5 px-3 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-brand-cream font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-zinc-400" />
                      <span>Ver Pre-cuenta</span>
                    </button>

                    <Link
                      to={`/admin/pos?table=${selectedTable.tableNumber}`}
                      className="py-2.5 px-3 bg-brand-surface-light hover:bg-zinc-800 border border-brand-border text-brand-orange font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir Productos</span>
                    </Link>
                  </div>

                  <div className="space-y-2 pt-1">
                    {selectedTable.status !== 'cuenta_pedida' && (
                      <button
                        onClick={() => handleAskBill(selectedTable.id)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors"
                      >
                        Marcar Cuenta Solicitada (Pedir Cuenta)
                      </button>
                    )}

                    <button
                      onClick={handleStartSettlement}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Cobrar y Liquidar Cuenta</span>
                    </button>

                    <button
                      onClick={handleCancelTableOrder}
                      className="w-full py-2 text-zinc-500 hover:text-red-400 font-medium text-[11px] transition-colors"
                    >
                      Anular Comanda y Liberar Mesa (Sin Cobro)
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* MESA SIN COMANDA ACTIVA */
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-300 font-bold">Mesa Libre y Disponible</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    No tiene consumos ni comandas activas asociadas.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
                  <Link
                    to={`/admin/pos?table=${selectedTable.tableNumber}`}
                    className="w-full py-2.5 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tomar Comanda en POS</span>
                  </Link>

                  {selectedTable.status === 'ocupada' ? (
                    <button
                      onClick={() => handleReleaseEmptyTable(selectedTable.id)}
                      className="w-full py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
                    >
                      Marcar como Disponible (Liberar)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenTable(selectedTable.id)}
                      className="w-full py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 transition-colors"
                    >
                      Marcar como Ocupada
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PRE-CUENTA TICKET */}
      {showPreReceipt && currentTableOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <h4 className="font-bold text-sm text-brand-cream flex items-center gap-2">
                <Printer className="w-4 h-4 text-brand-orange" />
                <span>Pre-cuenta Mesa #{selectedTable?.tableNumber}</span>
              </h4>
              <button
                onClick={() => setShowPreReceipt(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto bg-white p-3 rounded-2xl shadow-inner">
              <ThermalReceipt order={currentTableOrder} />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-amber text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setShowPreReceipt(false)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ABONO A FIADO */}
      {abonoCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAbonoSubmit}
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-brand-cream"
          >
            <h3 className="font-display text-2xl font-black text-brand-cream">Registrar Abono</h3>
            <p className="text-xs text-zinc-400">
              Cliente: <span className="font-bold text-white">{abonoCustomer.name}</span> · Saldo actual: {formatCurrency(abonoCustomer.creditBalance)}
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Valor del Abono (COP):</label>
              <input
                type="number"
                required
                max={abonoCustomer.creditBalance}
                value={abonoAmount}
                onChange={(e) => setAbonoAmount(e.target.value)}
                placeholder={String(abonoCustomer.creditBalance)}
                className="w-full p-3 rounded-xl bg-brand-surface-light border border-brand-border text-lg font-black text-brand-orange focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Método con el que cancela:</label>
              <select
                value={abonoMethod}
                onChange={(e) => setAbonoMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-xs text-brand-cream focus:outline-none"
              >
                <option value="efectivo">Efectivo (Entra a la caja abierta)</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
                <option value="transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-orange text-black font-bold rounded-xl text-xs hover:bg-brand-amber transition-colors"
              >
                Registrar Abono
              </button>
              <button
                type="button"
                onClick={() => setAbonoCustomer(null)}
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