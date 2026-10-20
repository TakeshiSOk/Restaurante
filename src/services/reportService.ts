import { useAppStore } from '../store/useAppStore';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export interface SalesReportFilter {
  startDate: Date;
  endDate: Date;
}

export interface DetailedFinancialMetrics {
  grossSales: number; // Ventas brutas (subtotal de platos vendidos)
  totalDiscounts: number; // Descuentos aplicados
  deliveryRevenue: number; // Recaudo por servicio de domicilio
  netSales: number; // Ventas netas (grossSales - discounts + deliveryRevenue)
  totalExpenses: number; // Gastos operativos registrados
  estimatedOperatingResult: number; // Resultado operativo estimado (netSales - totalExpenses)
  ordersCount: number; // Número de órdenes finalizadas
  averageTicket: number; // Ticket promedio de venta neta
  cancelledOrdersCount: number; // Órdenes canceladas
  cancelledAmount: number; // Valor de órdenes canceladas
  byChannel: { channel: string; total: number; count: number }[];
  byPaymentMethod: { method: string; total: number; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowRotationProducts: { name: string; quantity: number; revenue: number }[];
  hourlyDistribution: { hour: number; label: string; total: number; count: number }[];
  dailySales: { date: string; total: number; count: number }[];
}

export const ReportService = {
  async getMetrics(filter: SalesReportFilter): Promise<DetailedFinancialMetrics> {
    const { orders, expenses } = useAppStore.getState();

    const interval = {
      start: startOfDay(filter.startDate),
      end: endOfDay(filter.endDate),
    };

    // Pedidos entregados dentro del rango de fechas
    const deliveredOrders = orders.filter((o) => {
      try {
        const orderDate = parseISO(o.createdAt);
        return isWithinInterval(orderDate, interval) && o.status === 'entregado';
      } catch {
        return false;
      }
    });

    // Pedidos cancelados dentro del rango
    const cancelledOrders = orders.filter((o) => {
      try {
        const orderDate = parseISO(o.createdAt);
        return isWithinInterval(orderDate, interval) && o.status === 'cancelado';
      } catch {
        return false;
      }
    });

    // Gastos operativos registrados dentro del rango
    const periodExpenses = expenses.filter((e) => {
      try {
        const expenseDate = parseISO(e.date);
        return isWithinInterval(expenseDate, interval);
      } catch {
        return false;
      }
    });

    const grossSales = deliveredOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const totalDiscounts = deliveredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const deliveryRevenue = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const netSales = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedOperatingResult = netSales - totalExpenses;

    const ordersCount = deliveredOrders.length;
    const averageTicket = ordersCount > 0 ? Math.round(netSales / ordersCount) : 0;

    const cancelledOrdersCount = cancelledOrders.length;
    const cancelledAmount = cancelledOrders.reduce((sum, o) => sum + o.total, 0);

    // Por canal de venta (Web, Mostrador, Mesa, Domicilio)
    const channelMap: Record<string, { total: number; count: number }> = {};
    deliveredOrders.forEach((o) => {
      if (!channelMap[o.origin]) channelMap[o.origin] = { total: 0, count: 0 };
      channelMap[o.origin].total += o.total;
      channelMap[o.origin].count += 1;
    });
    const byChannel = Object.entries(channelMap).map(([channel, val]) => ({
      channel,
      total: val.total,
      count: val.count,
    }));

    // Recaudo por método de pago (excluye abonos duplicados)
    const methodMap: Record<string, { total: number; count: number }> = {};
    deliveredOrders.forEach((o) => {
      o.payments.forEach((p) => {
        if (!methodMap[p.method]) methodMap[p.method] = { total: 0, count: 0 };
        methodMap[p.method].total += p.amount;
        methodMap[p.method].count += 1;
      });
    });
    const byPaymentMethod = Object.entries(methodMap).map(([method, val]) => ({
      method,
      total: val.total,
      count: val.count,
    }));

    // Top y menor rotación
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    deliveredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productStats[item.name]) {
          productStats[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productStats[item.name].quantity += item.quantity;
        productStats[item.name].revenue += item.total;
      });
    });

    const sortedProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
    const topProducts = sortedProducts.slice(0, 10);
    const lowRotationProducts = [...sortedProducts].reverse().slice(0, 8);

    // Distribución horaria (11:00 a 23:00)
    const hourlyMap: Record<number, { total: number; count: number }> = {};
    for (let h = 11; h <= 23; h++) hourlyMap[h] = { total: 0, count: 0 };

    deliveredOrders.forEach((o) => {
      const h = parseISO(o.createdAt).getUTCHours();
      if (hourlyMap[h]) {
        hourlyMap[h].total += o.total;
        hourlyMap[h].count += 1;
      }
    });

    const hourlyDistribution = Object.entries(hourlyMap).map(([h, val]) => {
      const hourNum = parseInt(h, 10);
      return {
        hour: hourNum,
        label: `${hourNum}:00`,
        total: val.total,
        count: val.count,
      };
    });

    // Ventas por día cronológico
    const dailyMap: Record<string, { total: number; count: number }> = {};
    deliveredOrders.forEach((o) => {
      const dayKey = o.createdAt.split('T')[0];
      if (!dailyMap[dayKey]) dailyMap[dayKey] = { total: 0, count: 0 };
      dailyMap[dayKey].total += o.total;
      dailyMap[dayKey].count += 1;
    });

    const dailySales = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({
        date,
        total: val.total,
        count: val.count,
      }));

    return {
      grossSales,
      totalDiscounts,
      deliveryRevenue,
      netSales,
      totalExpenses,
      estimatedOperatingResult,
      ordersCount,
      averageTicket,
      cancelledOrdersCount,
      cancelledAmount,
      byChannel,
      byPaymentMethod,
      topProducts,
      lowRotationProducts,
      hourlyDistribution,
      dailySales,
    };
  },
};
