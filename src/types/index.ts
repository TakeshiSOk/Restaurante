// Tipos centrales del dominio CHAVES (TypeScript Estricto)

export type OrderStatus = 'recibido' | 'en_cocina' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';
export type OrderOrigin = 'web' | 'mostrador' | 'mesa' | 'domicilio' | 'whatsapp';
export type PaymentMethod = 'efectivo' | 'nequi' | 'daviplata' | 'transferencia' | 'tarjeta' | 'fiado';
export type StaffRole = 'dueno' | 'administrador' | 'cajero' | 'cocinero' | 'domiciliario' | 'cliente';
export type KitchenStation = 'parrilla' | 'freidora' | 'pizza' | 'general';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  sortOrder: number;
  gradient: string;
}

export interface Variant {
  id: string;
  name: string;
  price: number; // En pesos colombianos (COP entero)
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  items: AddonItem[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number | null; // null => "Consultar precio" (no vendible hasta definir precio)
  variants?: Variant[];
  addonGroups?: AddonGroup[];
  available: boolean;
  popular?: boolean;
  tags?: string[];
  image?: string;
  isCustomCombo?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  loyaltyPoints: number;
  creditBalance: number; // Saldo de fiado pendiente en COP
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  variantName?: string;
  addons: { id?: string; name: string; price: number }[];
  notes?: string;
  unitPrice: number;
  quantity: number;
  total: number;
  readyInKitchen?: boolean;
  station?: KitchenStation;
}

export interface OrderPayment {
  method: PaymentMethod;
  amount: number; // Monto aplicado a la venta
  receivedAmount?: number; // Monto entregado por el cliente (para efectivo)
  change?: number; // Vueltas entregadas
  reference?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  responsibleName?: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string; // ej: "CH-0231"
  origin: OrderOrigin;
  status: OrderStatus;
  customer: {
    id?: string;
    name: string;
    phone: string;
    address?: string;
    tableNumber?: string;
    zoneName?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountPercent?: number;
  deliveryFee: number;
  tip?: number;
  total: number;
  payments: OrderPayment[];
  timeline: OrderTimeline[];
  cashierId?: string;
  cashierName?: string;
  driverId?: string;
  driverName?: string;
  cancelReason?: string;
  cancelResponsible?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableAccount {
  id: string;
  tableNumber: string;
  status: 'disponible' | 'ocupada' | 'cuenta_pedida';
  currentOrderId?: string;
  orderIds: string[];
  guestCount: number;
  openedAt?: string;
  total: number;
}

export interface CashMovement {
  id: string;
  timestamp: string;
  type: 'ingreso' | 'egreso' | 'venta' | 'devolucion_cancelacion' | 'abono_fiado';
  amount: number;
  method: PaymentMethod;
  reason: string;
  cashierName: string;
  orderId?: string;
  customerId?: string;
}

export interface CashSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialFloat: number; // Base de caja
  movements: CashMovement[];
  countedCash?: number;
  expectedCash?: number;
  difference?: number;
  status: 'abierta' | 'cerrada';
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'proveedores' | 'servicios' | 'nomina' | 'arriendo' | 'mantenimiento' | 'otros';
  provider: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  registeredBy?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: 'kg' | 'unidad' | 'paquete' | 'litro' | 'lata';
  stock: number;
  minStock: number;
  costPerUnit: number;
  category: string;
  lastRestocked?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  estimatedMinutes: number;
  active: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  role: StaffRole;
  pin: string;
  phone: string;
  active: boolean;
  vehiclePlate?: string;
  registeredAt?: string;
}

export interface PriceAdjustmentAudit {
  id: string;
  date: string;
  percentage: number;
  appliedBy: string;
  affectedProductsCount: number;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  heroBadge?: string;
  heroHeadline?: string;
  legalName?: string;
  nit?: string;
  instagram?: string;
  logoUrl?: string;
  primaryColor?: string; // Color primario de marca (CSS Hex)
  secondaryColor?: string; // Color secundario de marca (CSS Hex)
  colorPaletteId?: string; // ID de paleta seleccionada
  presentationMode?: boolean; // Modo presentación (oculta complejidad para demos)
  phone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  isOpen: boolean;
  scheduleText: string;
  loyaltyPointsPer1000: number; // 1 punto por cada $1.000 COP
  pointValueInCop: number; // Valor de canje por punto
  theme: 'dark' | 'light';
  deliveryZones: DeliveryZone[];
  simulatedOrdersActive: boolean;
  printTicketHeader: string;
  printTicketFooter: string;
  inactivityTimeoutMinutes: number;
}

export interface DatabaseBackup {
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  cashSessions: CashSession[];
  tables: TableAccount[];
  inventory: InventoryItem[];
  expenses: Expense[];
  staff: Staff[];
  settings: BusinessSettings;
  priceAudits?: PriceAdjustmentAudit[];
}
