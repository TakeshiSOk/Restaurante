import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../lib/utils';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat,
  Bike,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { parseISO, isToday, isYesterday, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { orders, inventory, cashSessions } = useAppStore();

  // Métricas de Hoy vs Ayer
  const metrics = useMemo(() => {
    let todaySales = 0;
    let todayOrdersCount = 0;
    let yesterdaySales = 0;
    let yesterdayOrdersCount = 0;

    const hourlyMap: Record<number, number> = {};
    for (let h = 11; h <= 23; h++) hourlyMap[h] = 0;

    const activeOrders = orders.filter(
      (o) => o.status === 'recibido' || o.status === 'en_cocina' || o.status === 'listo' || o.status === 'en_camino'
    );

    const channelMap: Record<string, number> = {
      web: 0,
      mostrador: 0,
      mesa: 0,
      domicilio: 0,
      whatsapp: 0,
    };

    const paymentMap: Record<string, number> = {
      efectivo: 0,
      nequi: 0,
      daviplata: 0,
      transferencia: 0,
      tarjeta: 0,
    };

    const productSalesCount: Record<string, { name: string; qty: number; revenue: number }> = {};

    orders.forEach((o) => {
      if (o.status === 'cancelado') return;

      const date = parseISO(o.createdAt);

      if (isToday(date)) {
        todaySales += o.total;
        todayOrdersCount += 1;

        const h = date.getUTCHours();
        if (hourlyMap[h] !== undefined) {
          hourlyMap[h] += o.total;
        }
      } else if (isYesterday(date)) {
        yesterdaySales += o.total;
        yesterdayOrdersCount += 1;
      }

      // Conteo para canales y métodos de pago
      if (channelMap[o.origin] !== undefined) {
        channelMap[o.origin] += o.total;
      }

      o.payments.forEach((p) => {
        if (paymentMap[p.method] !== undefined) {
          paymentMap[p.method] += p.amount;
        }
      });

      // Productos
      o.items.forEach((item) => {
        if (!productSalesCount[item.name]) {
          productSalesCount[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSalesCount[item.name].qty += item.quantity;
        productSalesCount[item.name].revenue += item.total;
      });
    });

    const avgTicket = todayOrdersCount > 0 ? Math.round(todaySales / todayOrdersCount) : 0;
    const salesGrowth =
      yesterdaySales > 0 ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0;

    // Gráfica por hora
    const hourlyData = Object.entries(hourlyMap).map(([h, total]) => ({
      hour: `${h}:00`,
      total,
    }));

    // Canales
    const channelData = Object.entries(channelMap).map(([channel, total]) => ({
      name: channel === 'web' ? 'Web' : channel === 'mostrador' ? 'Mostrador' : channel === 'mesa' ? 'Mesa' : 'Domicilio',
      value: total,
    }));

    // Métodos de pago
    const paymentData = Object.entries(paymentMap).map(([method, total]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      value: total,
    }));

    // Top y Menos rotación
    const sortedProds = Object.values(productSalesCount).sort((a, b) => b.qty - a.qty);
    const topProducts = sortedProds.slice(0, 7);
    const lowRotationProducts = [...sortedProds].reverse().slice(0, 5);

    // Insumos bajos
    const lowStockItems = inventory.filter((i) => i.stock <= i.minStock);

    // Caja actual
    const currentSession = cashSessions.find((s) => s.status === 'abierta');
    const cashMovements = currentSession ? currentSession.movements : [];
    const cashBalance = cashMovements.reduce((acc, m) => {
      if (m.method !== 'efectivo') return acc;
      return m.type === 'ingreso' || m.type === 'venta' ? acc + m.amount : acc - m.amount;
    }, 0);

    return {
      todaySales,
      todayOrdersCount,
      yesterdaySales,
      salesGrowth,
      avgTicket,
      activeOrdersCount: activeOrders.length,
      hourlyData,
      channelData,
      paymentData,
      topProducts,
      lowRotationProducts,
      lowStockItems,
      cashBalance,
    };
  }, [orders, inventory, cashSessions]);

  const COLORS = ['#DC2626', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-cream tracking-wide">
            Dashboard General
          </h1>
          <p className="text-xs text-zinc-400">
            Resumen en vivo del restaurante · {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/pos"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white text-xs font-bold shadow-glow-red flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Abrir POS Mostrador</span>
          </Link>
          <Link
            to="/admin/cocina"
            className="px-3.5 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface-light border border-brand-border text-xs font-bold text-brand-orange flex items-center gap-1.5 transition-all"
          >
            <ChefHat className="w-4 h-4" />
            <span>Pantalla Cocina KDS</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Stock Bajo si existe */}
      {metrics.lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Alerta de Insumos:</span>{' '}
              {metrics.lowStockItems.length} insumo(s) están en o por debajo del mínimo recomendado (
              {metrics.lowStockItems.map((i) => i.name.split('(')[0]).join(', ')}).
            </div>
          </div>
          <Link
            to="/admin/inventario"
            className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg whitespace-nowrap hover:bg-amber-400 transition-colors"
          >
            Reabastecer
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Ventas de Hoy</span>
            <div className="p-2 rounded-xl bg-brand-red/10 text-brand-red-light">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl text-brand-cream">
            {formatCurrency(metrics.todaySales)}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {metrics.salesGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.salesGrowth}%
              </span>
            ) : (
              <span className="text-red-400 font-bold flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {metrics.salesGrowth}%
              </span>
            )}
            <span className="text-zinc-500">vs ayer ({formatCurrency(metrics.yesterdaySales)})</span>
          </div>
        </div>

        {/* # Pedidos Hoy */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Pedidos Hoy</span>
            <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl text-brand-cream">
            {metrics.todayOrdersCount} órdenes
          </div>
          <p className="text-[11px] text-zinc-500">
            Promedio ticket: <span className="font-bold text-zinc-300">{formatCurrency(metrics.avgTicket)}</span>
          </p>
        </div>

        {/* Pedidos Activos */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Pedidos en Proceso</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl text-purple-300">
            {metrics.activeOrdersCount} activos
          </div>
          <Link
            to="/admin/pedidos"
            className="text-[11px] text-purple-400 font-bold hover:underline inline-block"
          >
            Ver tablero de pedidos →
          </Link>
        </div>

        {/* Caja Actual */}
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Efectivo en Caja</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl text-emerald-400">
            {formatCurrency(metrics.cashBalance)}
          </div>
          <Link
            to="/admin/caja"
            className="text-[11px] text-emerald-400 font-bold hover:underline inline-block"
          >
            Ir a control de turno y cierre →
          </Link>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Distribution (Bar Chart) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-brand-cream">Ventas por Hora (Hoy)</h3>
              <p className="text-[11px] text-zinc-400">Picos de almuerzo y cena en tiempo real</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="total" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Canales de Venta (Donut Chart) */}
        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-brand-cream">Canales de Venta</h3>
            <p className="text-[11px] text-zinc-400">Distribución de ingresos por canal</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {metrics.channelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Ingresos']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-border/50 text-[11px]">
            {metrics.channelData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-zinc-400 truncate">{c.name}:</span>
                <span className="font-bold text-brand-cream ml-auto">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Products & Low Rotation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 7 más vendidos */}
        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-brand-cream">Top Platos Más Vendidos</h3>
              <p className="text-[11px] text-zinc-400">Ranking según cantidad histórica pedida</p>
            </div>
            <span className="text-xs bg-amber-500/10 text-brand-orange border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Estrellas
            </span>
          </div>

          <div className="space-y-3">
            {metrics.topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 font-black text-zinc-500 text-center">{idx + 1}</span>
                  <div>
                    <h4 className="font-bold text-brand-cream">{p.name}</h4>
                    <span className="text-[10px] text-zinc-400">{p.qty} unidades vendidas</span>
                  </div>
                </div>
                <span className="font-black text-brand-orange">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menor rotación */}
        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-brand-cream">Productos con Menor Rotación</h3>
              <p className="text-[11px] text-zinc-400">Candidatos para promociones o combos</p>
            </div>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
              Oportunidades
            </span>
          </div>

          <div className="space-y-3">
            {metrics.lowRotationProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 font-bold text-zinc-600 text-center">{idx + 1}</span>
                  <div>
                    <h4 className="font-medium text-brand-cream">{p.name}</h4>
                    <span className="text-[10px] text-zinc-500">{p.qty} unidades</span>
                  </div>
                </div>
                <span className="font-bold text-zinc-300">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
