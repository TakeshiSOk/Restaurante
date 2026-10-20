import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime, sanitizeCsvField } from '../../lib/utils';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  Truck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { subDays, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ReportsPage: React.FC = () => {
  const { orders, expenses } = useAppStore();

  const [dateRangePreset, setDateRangePreset] = useState<'today' | '7days' | '30days' | 'all'>('30days');

  // Cálculo del rango de fechas
  const dateInterval = useMemo(() => {
    const end = endOfDay(new Date());
    let start = startOfDay(new Date());

    if (dateRangePreset === '7days') {
      start = startOfDay(subDays(new Date(), 7));
    } else if (dateRangePreset === '30days') {
      start = startOfDay(subDays(new Date(), 30));
    } else if (dateRangePreset === 'all') {
      start = startOfDay(subDays(new Date(), 90));
    }

    return { start, end };
  }, [dateRangePreset]);

  // Filtrado de pedidos y gastos en el rango
  const { filteredOrders, cancelledOrders, filteredExpenses, metrics, dailyData, hourlyData, topProducts } = useMemo(() => {
    const fOrders = orders.filter((o) => {
      try {
        const d = parseISO(o.createdAt);
        return isWithinInterval(d, dateInterval) && o.status === 'entregado';
      } catch {
        return false;
      }
    });

    const cOrders = orders.filter((o) => {
      try {
        const d = parseISO(o.createdAt);
        return isWithinInterval(d, dateInterval) && o.status === 'cancelado';
      } catch {
        return false;
      }
    });

    const fExpenses = expenses.filter((e) => {
      try {
        const d = parseISO(e.date);
        return isWithinInterval(d, dateInterval);
      } catch {
        return false;
      }
    });

    const grossSales = fOrders.reduce((sum, o) => sum + (o.subtotal || o.total), 0);
    const totalDiscounts = fOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const deliveryRevenue = fOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const netSales = fOrders.reduce((sum, o) => sum + o.total, 0);
    const totalExp = fExpenses.reduce((sum, e) => sum + e.amount, 0);
    const operatingProfit = netSales - totalExp;
    const avgTicket = fOrders.length > 0 ? Math.round(netSales / fOrders.length) : 0;
    const cancelledAmount = cOrders.reduce((sum, o) => sum + o.total, 0);

    // Agrupación por día
    const dailyMap: Record<string, { total: number; count: number }> = {};
    fOrders.forEach((o) => {
      const day = o.createdAt.split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { total: 0, count: 0 };
      dailyMap[day].total += o.total;
      dailyMap[day].count += 1;
    });

    const dailyData = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, val]) => ({
        day: format(parseISO(day), 'dd/MM'),
        total: val.total,
        count: val.count,
      }));

    // Horas
    const hourlyMap: Record<number, number> = {};
    for (let h = 11; h <= 23; h++) hourlyMap[h] = 0;
    fOrders.forEach((o) => {
      const h = parseISO(o.createdAt).getUTCHours();
      if (hourlyMap[h] !== undefined) hourlyMap[h] += o.total;
    });

    const hourlyData = Object.entries(hourlyMap).map(([h, total]) => ({
      hour: `${h}:00`,
      total,
    }));

    // Top productos
    const prodMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    fOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!prodMap[item.name]) prodMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        prodMap[item.name].qty += item.quantity;
        prodMap[item.name].revenue += item.total;
      });
    });

    const topProducts = Object.values(prodMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      filteredOrders: fOrders,
      cancelledOrders: cOrders,
      filteredExpenses: fExpenses,
      metrics: {
        grossSales,
        totalDiscounts,
        deliveryRevenue,
        netSales,
        totalExp,
        operatingProfit,
        avgTicket,
        count: fOrders.length,
        cancelledCount: cOrders.length,
        cancelledAmount,
      },
      dailyData,
      hourlyData,
      topProducts,
    };
  }, [orders, expenses, dateInterval]);

  // Exportar reporte a CSV con saneamiento anti-inyección CWE-1236
  const handleExportCSV = () => {
    const headers = [
      'Codigo',
      'Fecha',
      'Canal',
      'Estado',
      'Cliente',
      'Telefono',
      'MetodoPago',
      'Subtotal',
      'Descuento',
      'Domicilio',
      'Total',
    ];

    const allExportOrders = [...filteredOrders, ...cancelledOrders];

    const rows = allExportOrders.map((o) => [
      sanitizeCsvField(o.code),
      sanitizeCsvField(o.createdAt),
      sanitizeCsvField(o.origin),
      sanitizeCsvField(o.status),
      sanitizeCsvField(o.customer.name),
      sanitizeCsvField(o.customer.phone),
      sanitizeCsvField(o.payments[0]?.method || 'sin_pago'),
      sanitizeCsvField(o.subtotal),
      sanitizeCsvField(o.discount || 0),
      sanitizeCsvField(o.deliveryFee || 0),
      sanitizeCsvField(o.total),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_chaves_${dateRangePreset}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Preset Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Reportes & Utilidad
          </h1>
          <p className="text-xs text-zinc-400">
            Análisis financiero consolidado y balance de operaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-brand-surface p-1 rounded-2xl border border-brand-border text-xs">
            {[
              { id: 'today' as const, label: 'Hoy' },
              { id: '7days' as const, label: '7 Días' },
              { id: '30days' as const, label: '30 Días' },
              { id: 'all' as const, label: 'Histórico Completo' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRangePreset(p.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  dateRangePreset === p.id
                    ? 'bg-brand-red text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-brand-surface hover:bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-brand-surface hover:bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingresos Netos */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <span className="text-xs text-zinc-400">Ventas Netas Realizadas</span>
          <div className="font-black text-2xl text-brand-cream">
            {formatCurrency(metrics.netSales)}
          </div>
          <p className="text-[11px] text-zinc-500">{metrics.count} pedidos completados</p>
        </div>

        {/* Total Gastos */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <span className="text-xs text-zinc-400">Gastos Operativos</span>
          <div className="font-black text-2xl text-red-400">
            -{formatCurrency(metrics.totalExp)}
          </div>
          <p className="text-[11px] text-zinc-500">Proveedores, nómina y servicios</p>
        </div>

        {/* Utilidad Operativa Estimada */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-orange/40 bg-brand-orange/5 space-y-2 shadow-sm">
          <span className="text-xs text-brand-orange font-bold">Utilidad Operativa Estimada</span>
          <div className="font-black text-2xl text-emerald-400">
            {formatCurrency(metrics.operatingProfit)}
          </div>
          <p className="text-[11px] text-zinc-400">
            Margen neto estimado:{' '}
            <span className="font-bold text-white">
              {metrics.netSales > 0 ? Math.round((metrics.operatingProfit / metrics.netSales) * 100) : 0}%
            </span>
          </p>
        </div>

        {/* Ticket Promedio */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <span className="text-xs text-zinc-400">Ticket Promedio</span>
          <div className="font-black text-2xl text-brand-orange">
            {formatCurrency(metrics.avgTicket)}
          </div>
          <p className="text-[11px] text-zinc-500">
            {metrics.count > 0 ? 'Promedio por pedido finalizado' : 'Sin pedidos'}
          </p>
        </div>
      </div>

      {/* Sub-strip: Desglose Financiero y Cancelaciones */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Venta Bruta</span>
            <span className="text-sm font-bold text-brand-cream">{formatCurrency(metrics.grossSales)}</span>
          </div>
          <Receipt className="w-4 h-4 text-zinc-500" />
        </div>

        <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Descuentos</span>
            <span className="text-sm font-bold text-amber-400">-{formatCurrency(metrics.totalDiscounts)}</span>
          </div>
          <DollarSign className="w-4 h-4 text-amber-500" />
        </div>

        <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Fletes Domicilio</span>
            <span className="text-sm font-bold text-blue-400">+{formatCurrency(metrics.deliveryRevenue)}</span>
          </div>
          <Truck className="w-4 h-4 text-blue-500" />
        </div>

        <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Cancelaciones ({metrics.cancelledCount})</span>
            <span className="text-sm font-bold text-red-400">{formatCurrency(metrics.cancelledAmount)}</span>
          </div>
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
        <div>
          <h3 className="font-bold text-sm text-brand-cream">Evolución Diaria de Ventas</h3>
          <p className="text-xs text-zinc-400">Comportamiento en el rango seleccionado</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
              <XAxis dataKey="day" stroke="#78716C" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#78716C"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px' }}
                formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Venta del día']}
              />
              <Area type="monotone" dataKey="total" stroke="#DC2626" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-brand-cream">Distribución por Hora del Día</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="hour" stroke="#78716C" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#78716C"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Ventas']}
                />
                <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Platos Más Vendidos */}
        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-brand-cream">Top 10 Platos en Este Período</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-5 font-black text-zinc-500">{idx + 1}</span>
                  <span className="font-semibold text-brand-cream truncate">{p.name}</span>
                </div>
                <div className="text-right whitespace-nowrap pl-2">
                  <span className="font-bold text-brand-orange">{formatCurrency(p.revenue)}</span>
                  <span className="text-[10px] text-zinc-500 block">({p.qty} un)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
