import {
  Customer,
  Staff,
  DeliveryZone,
  InventoryItem,
  Expense,
  Order,
  CashSession,
  TableAccount,
  BusinessSettings,
  OrderItem,
  OrderStatus,
  OrderOrigin,
  PaymentMethod,
} from '../types';
import { initialProducts } from './menu';
import { currentRestaurantConfig } from '../config/restaurant.config';

// Generador pseudoaleatorio determinista LCG
class SeededRandom {
  private seed: number;
  constructor(seed = 123456789) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export const initialStaff: Staff[] = [
  { id: 'st-dueno', name: 'Albeiro Chaves (Dueño)', role: 'dueno', pin: '1234', phone: '3104567890', active: true },
  { id: 'st-cajero', name: 'Laura Restrepo (Cajera)', role: 'cajero', pin: '2024', phone: '3123456789', active: true },
  { id: 'st-cocina', name: 'Don Javier Gómez (Parrilla/Cocina)', role: 'cocinero', pin: '3030', phone: '3157891234', active: true },
  { id: 'st-domi', name: 'Brayan Sneider (Domiciliario)', role: 'domiciliario', pin: '4040', phone: '3209876543', active: true },
];

export const initialDeliveryZones: DeliveryZone[] = [
  { id: 'zn-centro', name: 'Centro / Sector Histórico', cost: 3000, estimatedMinutes: 25, active: true },
  { id: 'zn-norte', name: 'Sector Norte / Los Álamos', cost: 4000, estimatedMinutes: 35, active: true },
  { id: 'zn-sur', name: 'Sector Sur / El Prado', cost: 4500, estimatedMinutes: 40, active: true },
  { id: 'zn-ciudadela', name: 'Ciudadela Nueva / Variante', cost: 6000, estimatedMinutes: 50, active: true },
  { id: 'zn-periferia', name: 'Veredas / Periferia', cost: 8500, estimatedMinutes: 60, active: true },
];

export const initialSettings: BusinessSettings = {
  name: currentRestaurantConfig.name,
  tagline: currentRestaurantConfig.tagline,
  heroBadge: currentRestaurantConfig.heroBadge,
  heroHeadline: currentRestaurantConfig.heroHeadline,
  legalName: currentRestaurantConfig.legalName,
  nit: currentRestaurantConfig.nit,
  instagram: currentRestaurantConfig.contact.instagram,
  logoUrl: currentRestaurantConfig.logoUrl,
  primaryColor: currentRestaurantConfig.theme.primaryColor,
  secondaryColor: currentRestaurantConfig.theme.secondaryColor,
  phone: currentRestaurantConfig.contact.phone,
  whatsappNumber: currentRestaurantConfig.contact.whatsappNumber,
  address: currentRestaurantConfig.contact.address,
  city: currentRestaurantConfig.contact.city,
  isOpen: true,
  scheduleText: currentRestaurantConfig.contact.scheduleText,
  loyaltyPointsPer1000: currentRestaurantConfig.loyalty.pointsPer1000,
  pointValueInCop: currentRestaurantConfig.loyalty.pointValueInCop,
  theme: 'dark',
  deliveryZones: initialDeliveryZones,
  simulatedOrdersActive: false,
  printTicketHeader: currentRestaurantConfig.ticket.header,
  printTicketFooter: currentRestaurantConfig.ticket.footer,
  inactivityTimeoutMinutes: 15,
};

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'Carlos Mario Londoño', phone: '3104529182', address: 'Cra 12 # 15-20', loyaltyPoints: 340, creditBalance: 48000, totalOrders: 28, totalSpent: 720000, createdAt: '2026-08-15T10:00:00Z', notes: 'Fiado autorizado por el dueño' },
  { id: 'cust-2', name: 'Marcela Quintero Peña', phone: '3157821902', address: 'Calle 9 # 14-30 Apto 201', loyaltyPoints: 190, creditBalance: 26000, totalOrders: 14, totalSpent: 390000, createdAt: '2026-08-20T11:00:00Z', notes: 'Vecina del local, paga cada quincena' },
  { id: 'cust-3', name: 'Andrés Felipe Morales', phone: '3208761234', address: 'Mz D Casa 14 Urb. El Roble', loyaltyPoints: 520, creditBalance: 0, totalOrders: 42, totalSpent: 1150000, createdAt: '2026-08-01T12:00:00Z' },
  { id: 'cust-4', name: 'Valentina Ospina Gómez', phone: '3119827364', address: 'Cra 7 # 19-54', loyaltyPoints: 280, creditBalance: 0, totalOrders: 19, totalSpent: 560000, createdAt: '2026-08-10T14:00:00Z' },
  { id: 'cust-5', name: 'Juan David Henao', phone: '3146729018', address: 'Calle 22 # 5-18', loyaltyPoints: 95, creditBalance: 0, totalOrders: 8, totalSpent: 210000, createdAt: '2026-08-25T15:00:00Z' },
  { id: 'cust-6', name: 'Camila Andrea Rincón', phone: '3128901243', address: 'Cra 10 # 8-11', loyaltyPoints: 410, creditBalance: 0, totalOrders: 31, totalSpent: 890000, createdAt: '2026-08-05T16:00:00Z' },
  { id: 'cust-7', name: 'Mateo Botero Gil', phone: '3137894561', address: 'Calle 18 # 11-40', loyaltyPoints: 150, creditBalance: 0, totalOrders: 11, totalSpent: 340000, createdAt: '2026-08-18T17:00:00Z' },
  { id: 'cust-8', name: 'Sandra Milena Rojas', phone: '3182345678', address: 'Cra 15 # 6-33', loyaltyPoints: 310, creditBalance: 0, totalOrders: 22, totalSpent: 620000, createdAt: '2026-08-12T18:00:00Z' },
  { id: 'cust-9', name: 'Fabián Darío Vargas', phone: '3176543210', address: 'Mz 3 Casa 8 Villa Luz', loyaltyPoints: 80, creditBalance: 0, totalOrders: 6, totalSpent: 165000, createdAt: '2026-08-28T19:00:00Z' },
  { id: 'cust-10', name: 'Daniela Salazar Toro', phone: '3198765432', address: 'Calle 11 # 13-05', loyaltyPoints: 240, creditBalance: 0, totalOrders: 17, totalSpent: 480000, createdAt: '2026-08-14T20:00:00Z' },
  { id: 'cust-11', name: 'Sebastián Cañas Ortiz', phone: '3109871234', address: 'Cra 8 # 21-15', loyaltyPoints: 170, creditBalance: 0, totalOrders: 13, totalSpent: 375000, createdAt: '2026-08-22T10:00:00Z' },
  { id: 'cust-12', name: 'Paola Andrea Jaramillo', phone: '3124567891', address: 'Calle 15 # 10-22', loyaltyPoints: 360, creditBalance: 0, totalOrders: 26, totalSpent: 790000, createdAt: '2026-08-08T11:00:00Z' },
  { id: 'cust-13', name: 'Julián Esteban Marín', phone: '3156789123', address: 'Cra 14 # 16-45', loyaltyPoints: 120, creditBalance: 0, totalOrders: 9, totalSpent: 260000, createdAt: '2026-08-24T12:00:00Z' },
  { id: 'cust-14', name: 'Nathalia Vélez Aguirre', phone: '3201234567', address: 'Mz B Casa 12 Prados', loyaltyPoints: 460, creditBalance: 0, totalOrders: 35, totalSpent: 990000, createdAt: '2026-08-03T13:00:00Z' },
  { id: 'cust-15', name: 'Diego Fernando Ruiz', phone: '3112345678', address: 'Calle 7 # 12-18', loyaltyPoints: 210, creditBalance: 0, totalOrders: 15, totalSpent: 430000, createdAt: '2026-08-16T14:00:00Z' },
  { id: 'cust-16', name: 'Gloria Patricia Sierra', phone: '3145678912', address: 'Cra 9 # 17-29', loyaltyPoints: 130, creditBalance: 0, totalOrders: 10, totalSpent: 295000, createdAt: '2026-08-21T15:00:00Z' },
  { id: 'cust-17', name: 'Alejandro Giraldo', phone: '3187654321', address: 'Calle 19 # 8-50', loyaltyPoints: 290, creditBalance: 0, totalOrders: 21, totalSpent: 590000, createdAt: '2026-08-11T16:00:00Z' },
  { id: 'cust-18', name: 'Tatiana Muñoz Arango', phone: '3171234567', address: 'Cra 11 # 14-12', loyaltyPoints: 380, creditBalance: 0, totalOrders: 29, totalSpent: 810000, createdAt: '2026-08-07T17:00:00Z' },
  { id: 'cust-19', name: 'Jorge Iván Cárdenas', phone: '3192345678', address: 'Calle 25 # 6-10', loyaltyPoints: 70, creditBalance: 0, totalOrders: 5, totalSpent: 140000, createdAt: '2026-08-29T18:00:00Z' },
  { id: 'cust-20', name: 'Catalina Tamayo Cruz', phone: '3101239876', address: 'Cra 13 # 9-44', loyaltyPoints: 330, creditBalance: 0, totalOrders: 24, totalSpent: 670000, createdAt: '2026-08-13T19:00:00Z' },
  { id: 'cust-21', name: 'Nicolás Pineda Castaño', phone: '3159876541', address: 'Calle 13 # 15-32', loyaltyPoints: 160, creditBalance: 0, totalOrders: 12, totalSpent: 350000, createdAt: '2026-08-19T20:00:00Z' },
  { id: 'cust-22', name: 'Estefanía Osorio', phone: '3204561239', address: 'Cra 6 # 18-09', loyaltyPoints: 250, creditBalance: 0, totalOrders: 18, totalSpent: 510000, createdAt: '2026-08-15T11:00:00Z' },
  { id: 'cust-23', name: 'Mauricio Betancur', phone: '3116549872', address: 'Calle 16 # 7-19', loyaltyPoints: 420, creditBalance: 0, totalOrders: 32, totalSpent: 920000, createdAt: '2026-08-04T12:00:00Z' },
  { id: 'cust-24', name: 'Lina María Cardona', phone: '3149872345', address: 'Cra 16 # 11-20', loyaltyPoints: 110, creditBalance: 0, totalOrders: 8, totalSpent: 235000, createdAt: '2026-08-26T13:00:00Z' },
  { id: 'cust-25', name: 'Héctor Fabio Valencia', phone: '3183456789', address: 'Calle 8 # 14-55', loyaltyPoints: 200, creditBalance: 0, totalOrders: 14, totalSpent: 420000, createdAt: '2026-08-17T14:00:00Z' },
  { id: 'cust-26', name: 'Diana Marcela Echeverri', phone: '3178901234', address: 'Cra 10 # 20-14', loyaltyPoints: 370, creditBalance: 0, totalOrders: 27, totalSpent: 780000, createdAt: '2026-08-09T15:00:00Z' },
  { id: 'cust-27', name: 'Santiago Restrepo Duque', phone: '3194567812', address: 'Calle 21 # 9-30', loyaltyPoints: 90, creditBalance: 0, totalOrders: 7, totalSpent: 195000, createdAt: '2026-08-27T16:00:00Z' },
  { id: 'cust-28', name: 'Carolina Tabares', phone: '3107894512', address: 'Cra 12 # 8-36', loyaltyPoints: 490, creditBalance: 0, totalOrders: 38, totalSpent: 1040000, createdAt: '2026-08-02T17:00:00Z' },
  { id: 'cust-29', name: 'Víctor Manuel Peláez', phone: '3126781239', address: 'Calle 10 # 16-15', loyaltyPoints: 140, creditBalance: 0, totalOrders: 10, totalSpent: 280000, createdAt: '2026-08-23T18:00:00Z' },
  { id: 'cust-30', name: 'Jessica Paola Cuartas', phone: '3151239845', address: 'Cra 15 # 13-41', loyaltyPoints: 270, creditBalance: 0, totalOrders: 20, totalSpent: 570000, createdAt: '2026-08-14T19:00:00Z' },
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv-carne-hamb', name: 'Carne artesanal para hamburguesa (kg)', unit: 'kg', stock: 24, minStock: 10, costPerUnit: 22000, category: 'Carnes', lastRestocked: '2026-10-18T08:00:00Z' },
  { id: 'inv-pollo', name: 'Pechuga de pollo fresca (kg)', unit: 'kg', stock: 18, minStock: 8, costPerUnit: 17500, category: 'Carnes', lastRestocked: '2026-10-18T08:00:00Z' },
  { id: 'inv-carne-desmechada', name: 'Carne de res para desmechar (kg)', unit: 'kg', stock: 15, minStock: 7, costPerUnit: 24000, category: 'Carnes', lastRestocked: '2026-10-17T09:00:00Z' },
  { id: 'inv-costilla', name: 'Costilla de cerdo parrillera (kg)', unit: 'kg', stock: 12, minStock: 6, costPerUnit: 21000, category: 'Carnes', lastRestocked: '2026-10-18T08:30:00Z' },
  { id: 'inv-chorizo', name: 'Chorizo parrillero artesanal', unit: 'unidad', stock: 85, minStock: 30, costPerUnit: 2800, category: 'Carnes', lastRestocked: '2026-10-16T10:00:00Z' },
  { id: 'inv-tocineta', name: 'Tocineta ahumada laminada (kg)', unit: 'kg', stock: 7.5, minStock: 4, costPerUnit: 29000, category: 'Carnes', lastRestocked: '2026-10-17T11:00:00Z' },
  { id: 'inv-papa-francesa', name: 'Papa francesa congelada corte grueso (kg)', unit: 'kg', stock: 42, minStock: 20, costPerUnit: 9000, category: 'Papas', lastRestocked: '2026-10-18T09:00:00Z' },
  // Alerta bajo stock:
  { id: 'inv-papa-criolla', name: 'Papa criolla fresca lavada (kg)', unit: 'kg', stock: 3.8, minStock: 10, costPerUnit: 5200, category: 'Papas', lastRestocked: '2026-10-15T08:00:00Z' },
  // Alerta bajo stock:
  { id: 'inv-queso-mozzarella', name: 'Queso mozzarella en bloque (kg)', unit: 'kg', stock: 4.5, minStock: 12, costPerUnit: 26000, category: 'Lácteos', lastRestocked: '2026-10-16T10:00:00Z' },
  { id: 'inv-platano-verde', name: 'Plátano verde para patacones', unit: 'unidad', stock: 65, minStock: 25, costPerUnit: 1400, category: 'Verduras', lastRestocked: '2026-10-17T07:30:00Z' },
  { id: 'inv-platano-maduro', name: 'Plátano maduro en cubos', unit: 'unidad', stock: 40, minStock: 15, costPerUnit: 1200, category: 'Verduras', lastRestocked: '2026-10-18T07:30:00Z' },
  { id: 'inv-maiz-tierno', name: 'Maíz tierno dulce en lata (lata)', unit: 'lata', stock: 26, minStock: 10, costPerUnit: 7800, category: 'Enlatados', lastRestocked: '2026-10-17T14:00:00Z' },
  { id: 'inv-pan-hamburguesa', name: 'Pan de hamburguesa ajonjolí (paquete x 10)', unit: 'paquete', stock: 18, minStock: 8, costPerUnit: 13000, category: 'Panadería', lastRestocked: '2026-10-19T06:00:00Z' },
  { id: 'inv-cajas-domicilio', name: 'Cajas térmicas biodegradables para domicilio', unit: 'unidad', stock: 210, minStock: 80, costPerUnit: 750, category: 'Empaques', lastRestocked: '2026-10-14T11:00:00Z' },
  { id: 'inv-aceite', name: 'Aceite vegetal para freidora (bidón 20L)', unit: 'unidad', stock: 2, minStock: 1, costPerUnit: 165000, category: 'Abarrotes', lastRestocked: '2026-10-12T15:00:00Z' },
  { id: 'inv-gas-pipeta', name: 'Pipeta de gas propano 40lb', unit: 'unidad', stock: 2, minStock: 1, costPerUnit: 98000, category: 'Servicios', lastRestocked: '2026-10-10T12:00:00Z' },
];

export const initialExpenses: Expense[] = [
  { id: 'exp-1', date: '2026-10-18T10:00:00Z', category: 'proveedores', provider: 'Distribuidora Carnes del Valle', description: 'Compra semanal carne res, cerdo, pechuga y tocineta', amount: 890000, paymentMethod: 'transferencia' },
  { id: 'exp-2', date: '2026-10-17T14:00:00Z', category: 'proveedores', provider: 'Avícola Santa Rita', description: 'Alitas de pollo y pechugas frescas', amount: 320000, paymentMethod: 'transferencia' },
  { id: 'exp-3', date: '2026-10-16T11:00:00Z', category: 'servicios', provider: 'Gases de Occidente', description: 'Recarga 2 pipetas de gas propano de 40 lbs', amount: 196000, paymentMethod: 'efectivo' },
  { id: 'exp-4', date: '2026-10-15T18:00:00Z', category: 'nomina', provider: 'Nómina Primera Quincena Octubre', description: 'Pago salarial quincenal auxiliares de cocina y cajero', amount: 2400000, paymentMethod: 'transferencia' },
  { id: 'exp-5', date: '2026-10-14T09:30:00Z', category: 'proveedores', provider: 'Empaques y Plásticos del Eje', description: 'Cajas para salchipapas, bolsas, servilletas y vasos', amount: 285000, paymentMethod: 'daviplata' },
  { id: 'exp-6', date: '2026-10-12T16:00:00Z', category: 'mantenimiento', provider: 'Técnico Refrigeración y Frío', description: 'Mantenimiento preventivo congeladores y plancha', amount: 180000, paymentMethod: 'efectivo' },
  { id: 'exp-7', date: '2026-10-05T09:00:00Z', category: 'arriendo', provider: 'Inmobiliaria Central', description: 'Canon de arrendamiento local comercial octubre', amount: 220000, paymentMethod: 'transferencia' },
  { id: 'exp-8', date: '2026-10-02T10:00:00Z', category: 'servicios', provider: 'Empresas Públicas Municipales', description: 'Factura mensual agua, aseo y energía eléctrica', amount: 480000, paymentMethod: 'nequi' },
];

export const initialTables: TableAccount[] = [
  { id: 'tbl-1', tableNumber: '1', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-2', tableNumber: '2', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-3', tableNumber: '3', status: 'ocupada', orderIds: ['ord-active-2'], guestCount: 4, openedAt: '2026-10-20T01:30:00Z', total: 68000 },
  { id: 'tbl-4', tableNumber: '4', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-5', tableNumber: '5', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-6', tableNumber: '6', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-7', tableNumber: '7', status: 'cuenta_pedida', orderIds: ['ord-active-3'], guestCount: 2, openedAt: '2026-10-20T01:10:00Z', total: 54000 },
  { id: 'tbl-8', tableNumber: '8', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-9', tableNumber: '9', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-10', tableNumber: '10', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-11', tableNumber: '11', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
  { id: 'tbl-12', tableNumber: '12', status: 'disponible', orderIds: [], guestCount: 0, total: 0 },
];

// Generador de 60 días de historial de órdenes determinista
export function generateSeedOrders(): Order[] {
  const rng = new SeededRandom(42);
  const orders: Order[] = [];
  const now = new Date('2026-10-20T02:00:00Z');

  const origins: OrderOrigin[] = ['web', 'mostrador', 'mesa', 'domicilio', 'whatsapp'];
  const paymentMethods: PaymentMethod[] = ['efectivo', 'nequi', 'daviplata', 'transferencia', 'tarjeta'];

  // Productos con precio definido para generar órdenes
  const pricedProducts = initialProducts.filter((p) => p.basePrice !== null && p.basePrice > 0);

  let orderSequence = 100;

  // Generamos 60 días hacia atrás
  for (let dayOffset = 59; dayOffset >= 1; dayOffset--) {
    const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dayOfWeek = orderDate.getUTCDay(); // 0 = Domingo, 5 = Viernes, 6 = Sábado
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

    // Fines de semana tienen más volumen (35-55 pedidos), entre semana (20-35 pedidos)
    const dailyCount = isWeekend ? rng.range(35, 55) : rng.range(20, 35);

    for (let i = 0; i < dailyCount; i++) {
      orderSequence++;
      const code = `CH-${String(orderSequence).padStart(4, '0')}`;

      // Distribución por hora: 35% almuerzo (12-14h), 55% cena (18-22h), 10% media tarde (15-17h)
      const hourRoll = rng.next();
      let hour: number;
      if (hourRoll < 0.35) {
        hour = rng.range(12, 14);
      } else if (hourRoll < 0.45) {
        hour = rng.range(15, 17);
      } else {
        hour = rng.range(18, 22);
      }
      const minute = rng.range(0, 59);

      const itemDate = new Date(orderDate);
      itemDate.setUTCHours(hour, minute, 0, 0);
      const createdAtIso = itemDate.toISOString();

      // Cliente aleatorio
      const customer = rng.pick(initialCustomers);
      const origin = rng.pick(origins);
      const paymentMethod = rng.pick(paymentMethods);

      // 1 a 3 productos por pedido
      const itemCount = rng.range(1, 3);
      const items: OrderItem[] = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const prod = rng.pick(pricedProducts);
        const qty = rng.range(1, 2);
        let unitPrice = prod.basePrice || 20000;
        let variantName: string | undefined;

        if (prod.variants && prod.variants.length > 0) {
          const variant = rng.pick(prod.variants);
          unitPrice = variant.price;
          variantName = variant.name;
        }

        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;

        items.push({
          id: `item-${orderSequence}-${j}`,
          productId: prod.id,
          name: prod.name,
          variantName,
          addons: [],
          unitPrice,
          quantity: qty,
          total: itemTotal,
          readyInKitchen: true,
          station: prod.categoryId === 'pizzas' ? 'pizza' : prod.categoryId.includes('salchipapa') ? 'freidora' : 'parrilla',
        });
      }

      // Costo de domicilio si aplica
      const deliveryFee = origin === 'domicilio' ? rng.pick([3000, 4000, 4500, 6000]) : 0;
      const discount = rng.next() < 0.15 ? rng.pick([2000, 3000, 5000]) : 0;
      const total = Math.max(0, subtotal - discount + deliveryFee);

      // Estado histórico: 97% entregado, 3% cancelado
      const isCancelled = rng.next() < 0.03;
      const status: OrderStatus = isCancelled ? 'cancelado' : 'entregado';

      orders.push({
        id: `ord-${orderSequence}`,
        code,
        origin,
        status,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: origin === 'domicilio' ? customer.address : undefined,
          tableNumber: origin === 'mesa' ? String(rng.range(1, 10)) : undefined,
        },
        items,
        subtotal,
        discount,
        deliveryFee,
        total,
        payments: isCancelled
          ? []
          : [
              {
                method: paymentMethod,
                amount: total,
                receivedAmount: paymentMethod === 'efectivo' ? Math.ceil(total / 10000) * 10000 : total,
                change: paymentMethod === 'efectivo' ? Math.max(0, Math.ceil(total / 10000) * 10000 - total) : 0,
              },
            ],
        timeline: [
          { status: 'recibido', timestamp: createdAtIso },
          { status: 'en_cocina', timestamp: new Date(itemDate.getTime() + 4 * 60000).toISOString() },
          { status: 'listo', timestamp: new Date(itemDate.getTime() + 18 * 60000).toISOString() },
          ...(status === 'entregado'
            ? [{ status: 'entregado' as OrderStatus, timestamp: new Date(itemDate.getTime() + 32 * 60000).toISOString() }]
            : [{ status: 'cancelado' as OrderStatus, timestamp: new Date(itemDate.getTime() + 8 * 60000).toISOString(), note: 'Cancelado a petición del cliente' }]),
        ],
        cashierId: 'st-cajero',
        cashierName: 'Laura Restrepo',
        driverId: origin === 'domicilio' ? 'st-domi' : undefined,
        driverName: origin === 'domicilio' ? 'Brayan Sneider' : undefined,
        cancelReason: isCancelled ? 'Cancelado a petición del cliente por demora' : undefined,
        createdAt: createdAtIso,
        updatedAt: new Date(itemDate.getTime() + 35 * 60000).toISOString(),
      });
    }
  }

  // Ahora agregamos las 5 órdenes activas del día de hoy en distintos estados
  const activeOrders: Order[] = [
    {
      id: 'ord-active-1',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'web',
      status: 'recibido',
      customer: {
        id: 'cust-4',
        name: 'Valentina Ospina Gómez',
        phone: '3119827364',
        address: 'Cra 7 # 19-54',
        zoneName: 'Centro / Sector Histórico',
      },
      items: [
        {
          id: 'act-item-1',
          productId: 'bg-combi',
          name: 'La Combi Completa',
          addons: [{ name: 'Queso costeño gratinado', price: 4000 }],
          notes: 'Sin cebolla y con bastante salsa de la casa por favor',
          unitPrice: 34000,
          quantity: 1,
          total: 38000,
          readyInKitchen: false,
          station: 'parrilla',
        },
        {
          id: 'act-item-2',
          productId: 'beb-limonada',
          name: 'Limonada Natural / Cerezada',
          addons: [],
          unitPrice: 8000,
          quantity: 1,
          total: 8000,
          readyInKitchen: false,
          station: 'general',
        },
      ],
      subtotal: 46000,
      discount: 0,
      deliveryFee: 3000,
      total: 49000,
      payments: [{ method: 'nequi', amount: 49000 }],
      timeline: [{ status: 'recibido', timestamp: '2026-10-20T01:52:00Z' }],
      createdAt: '2026-10-20T01:52:00Z',
      updatedAt: '2026-10-20T01:52:00Z',
      notes: 'Timbrar al apto 302',
    },
    {
      id: 'ord-active-2',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mesa',
      status: 'en_cocina',
      customer: {
        name: 'Familia Ramírez (Mesa 3)',
        phone: '3104529182',
        tableNumber: '3',
      },
      items: [
        {
          id: 'act-item-3',
          productId: 'sg-caprichosa',
          name: 'La Caprichosa',
          variantName: 'Papa criolla doradita',
          addons: [],
          unitPrice: 34000,
          quantity: 2,
          total: 68000,
          readyInKitchen: false,
          station: 'freidora',
        },
      ],
      subtotal: 68000,
      discount: 0,
      deliveryFee: 0,
      total: 68000,
      payments: [{ method: 'efectivo', amount: 68000, receivedAmount: 70000, change: 2000 }],
      timeline: [
        { status: 'recibido', timestamp: '2026-10-20T01:30:00Z' },
        { status: 'en_cocina', timestamp: '2026-10-20T01:32:00Z' },
      ],
      cashierId: 'st-cajero',
      cashierName: 'Laura Restrepo',
      createdAt: '2026-10-20T01:30:00Z',
      updatedAt: '2026-10-20T01:32:00Z',
    },
    {
      id: 'ord-active-3',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mesa',
      status: 'listo',
      customer: {
        name: 'Mesa 7 (Cuenta pedida)',
        phone: '3187654321',
        tableNumber: '7',
      },
      items: [
        {
          id: 'act-item-4',
          productId: 'pz-mixta-esp',
          name: 'Pizza Mixta Especial',
          variantName: 'Mediana (8 porciones)',
          addons: [],
          unitPrice: 40000,
          quantity: 1,
          total: 40000,
          readyInKitchen: true,
          station: 'pizza',
        },
        {
          id: 'act-item-5',
          productId: 'beb-cerveza',
          name: 'Cerveza Nacional Helada',
          addons: [],
          unitPrice: 7000,
          quantity: 2,
          total: 14000,
          readyInKitchen: true,
          station: 'general',
        },
      ],
      subtotal: 54000,
      discount: 0,
      deliveryFee: 0,
      total: 54000,
      payments: [{ method: 'daviplata', amount: 54000 }],
      timeline: [
        { status: 'recibido', timestamp: '2026-10-20T01:10:00Z' },
        { status: 'en_cocina', timestamp: '2026-10-20T01:12:00Z' },
        { status: 'listo', timestamp: '2026-10-20T01:28:00Z' },
      ],
      cashierId: 'st-cajero',
      cashierName: 'Laura Restrepo',
      createdAt: '2026-10-20T01:10:00Z',
      updatedAt: '2026-10-20T01:28:00Z',
    },
    {
      id: 'ord-active-4',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'domicilio',
      status: 'en_camino',
      customer: {
        id: 'cust-3',
        name: 'Andrés Felipe Morales',
        phone: '3208761234',
        address: 'Mz D Casa 14 Urb. El Roble',
        zoneName: 'Sector Norte / Los Álamos',
      },
      items: [
        {
          id: 'act-item-6',
          productId: 'as-churrasco',
          name: 'Churrasco al Carbón (350g)',
          addons: [{ name: 'Porción de Guacamole', price: 4000 }],
          notes: 'Término tres cuartos (3/4)',
          unitPrice: 30000,
          quantity: 1,
          total: 34000,
          readyInKitchen: true,
          station: 'parrilla',
        },
        {
          id: 'act-item-7',
          productId: 'beb-gaseosa-pers',
          name: 'Gaseosa Personal 400ml',
          addons: [],
          unitPrice: 4500,
          quantity: 1,
          total: 4500,
          readyInKitchen: true,
          station: 'general',
        },
      ],
      subtotal: 38500,
      discount: 0,
      deliveryFee: 4000,
      total: 42500,
      payments: [{ method: 'transferencia', amount: 42500 }],
      timeline: [
        { status: 'recibido', timestamp: '2026-10-20T01:05:00Z' },
        { status: 'en_cocina', timestamp: '2026-10-20T01:08:00Z' },
        { status: 'listo', timestamp: '2026-10-20T01:24:00Z' },
        { status: 'en_camino', timestamp: '2026-10-20T01:30:00Z' },
      ],
      cashierId: 'st-cajero',
      cashierName: 'Laura Restrepo',
      driverId: 'st-domi',
      driverName: 'Brayan Sneider',
      createdAt: '2026-10-20T01:05:00Z',
      updatedAt: '2026-10-20T01:30:00Z',
    },
    {
      id: 'ord-active-5',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mostrador',
      status: 'en_cocina',
      customer: {
        name: 'Cliente Mostrador (Para Llevar)',
        phone: '3146729018',
      },
      items: [
        {
          id: 'act-item-8',
          productId: 'sw-tentador',
          name: 'Sándwich Tentador',
          addons: [],
          unitPrice: 25000,
          quantity: 1,
          total: 25000,
          readyInKitchen: false,
          station: 'parrilla',
        },
      ],
      subtotal: 25000,
      discount: 0,
      deliveryFee: 0,
      total: 25000,
      payments: [{ method: 'efectivo', amount: 25000, receivedAmount: 50000, change: 25000 }],
      timeline: [
        { status: 'recibido', timestamp: '2026-10-20T01:40:00Z' },
        { status: 'en_cocina', timestamp: '2026-10-20T01:42:00Z' },
      ],
      cashierId: 'st-cajero',
      cashierName: 'Laura Restrepo',
      createdAt: '2026-10-20T01:40:00Z',
      updatedAt: '2026-10-20T01:42:00Z',
    },
  ];

  return [...orders, ...activeOrders];
}

export const initialCashSession: CashSession = {
  id: 'cs-turn-today',
  openedAt: '2026-10-20T00:30:00Z',
  openedBy: 'Laura Restrepo',
  initialFloat: 150000, // Base en efectivo $150.000 COP
  status: 'abierta',
  movements: [
    {
      id: 'mov-1',
      timestamp: '2026-10-20T00:30:00Z',
      type: 'ingreso',
      amount: 150000,
      method: 'efectivo',
      reason: 'Base inicial de apertura de turno',
      cashierName: 'Laura Restrepo',
    },
    {
      id: 'mov-2',
      timestamp: '2026-10-20T01:15:00Z',
      type: 'egreso',
      amount: 25000,
      method: 'efectivo',
      reason: 'Compra de hielo de emergencia en la tienda',
      cashierName: 'Laura Restrepo',
    },
    {
      id: 'mov-3',
      timestamp: '2026-10-20T01:45:00Z',
      type: 'venta',
      amount: 25000,
      method: 'efectivo',
      reason: 'Venta mostrador CH-2384',
      cashierName: 'Laura Restrepo',
      orderId: 'ord-active-5',
    },
  ],
};
