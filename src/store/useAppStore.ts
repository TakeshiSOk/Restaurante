import { create } from 'zustand';
import {
  Category,
  Product,
  Order,
  Customer,
  CashSession,
  TableAccount,
  Expense,
  InventoryItem,
  Staff,
  BusinessSettings,
  OrderStatus,
  PaymentMethod,
  CashMovement,
  DatabaseBackup,
  PriceAdjustmentAudit,
} from '../types';
import { categoriesData, initialProducts } from '../data/menu';
import {
  initialStaff,
  initialSettings,
  initialCustomers,
  initialInventory,
  initialExpenses,
  initialTables,
  generateSeedOrders,
  initialCashSession,
} from '../data/seed';
import { syncManager } from '../lib/syncChannel';
import { getProductImage } from '../lib/utils';

export interface CartItem {
  id: string;
  product: Product;
  variantName?: string;
  unitPrice: number;
  addons: { id?: string; name: string; price: number }[];
  quantity: number;
  notes?: string;
  total: number;
}

export interface AppState {
  // Entidades principales
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
  priceAudits: PriceAdjustmentAudit[];

  // Estado de sesión y UI
  currentUser: Staff | null;
  cart: CartItem[];
  activeNotification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  lastActiveTimestamp: number;

  // Acciones de Autenticación
  loginWithPin: (pin: string) => boolean;
  loginAsStaff: (staffId: string) => void;
  logout: () => void;
  updateActivity: () => void;

  // Acciones de Carrito
  addToCart: (item: Omit<CartItem, 'id' | 'total'>) => boolean;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  // Acciones de Pedidos
  createOrder: (orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, driverId?: string, driverName?: string) => void;
  cancelOrder: (orderId: string, reason: string, responsibleName?: string) => void;
  toggleItemReady: (orderId: string, itemId: string) => void;
  assignDriver: (orderId: string, driverId: string, driverName: string) => void;

  // Acciones de Productos
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailable: (id: string) => void;
  toggleProductPopular: (id: string) => void;
  bulkAdjustPrices: (percentage: number, appliedBy: string) => PriceAdjustmentAudit;

  // Acciones de Caja
  openCashSession: (openedBy: string, initialFloat: number) => CashSession;
  addCashMovement: (movement: Omit<CashMovement, 'id' | 'timestamp'>) => void;
  closeCashSession: (countedCash: number, closedBy: string, notes?: string) => void;

  // Acciones de Mesas
  updateTableStatus: (tableId: string, status: TableAccount['status'], orderId?: string, guestCount?: number) => void;
  releaseTable: (tableId: string) => void;

  // Acciones de Clientes y Fiado
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'creditBalance' | 'totalOrders' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  recordCreditPayment: (customerId: string, amount: number, method: PaymentMethod, cashierName?: string) => void;
  addLoyaltyPoints: (customerId: string, points: number) => void;

  // Acciones de Inventario
  adjustInventoryStock: (id: string, delta: number) => void;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;

  // Acciones de Gastos
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;

  // Configuración y Utilidades
  updateSettings: (patch: Partial<BusinessSettings>) => void;
  toggleTheme: () => void;
  setNotification: (notification: AppState['activeNotification']) => void;
  resetToDemoData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => { success: boolean; error?: string };
}

const STORAGE_KEY = 'chaves_burguer_store_v2';
const CURRENT_SCHEMA_VERSION = 2;

function loadInitialState() {
  if (typeof window === 'undefined') {
    return getFallbackState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const storedProducts = (parsed.products || initialProducts).map((p: Product) => {
          const validImg =
            p.image && !p.image.includes('burger-sample.png') && p.image.startsWith('/images/')
              ? p.image
              : getProductImage(p);
          return { ...p, image: validImg };
        });

        return {
          categories: parsed.categories || categoriesData,
          products: storedProducts,
          orders: parsed.orders || [],
          customers: parsed.customers || initialCustomers,
          cashSessions: parsed.cashSessions || [initialCashSession],
          tables: parsed.tables || initialTables,
          inventory: parsed.inventory || initialInventory,
          expenses: parsed.expenses || initialExpenses,
          staff: parsed.staff || initialStaff,
          settings: { ...initialSettings, ...(parsed.settings || {}) },
          priceAudits: parsed.priceAudits || [],
        };
      }
    }
  } catch (e) {
    console.warn('Error al cargar datos desde localStorage, inicializando seed determinista:', e);
  }

  return getFallbackState();
}

function getFallbackState() {
  const generatedOrders = generateSeedOrders();
  return {
    categories: categoriesData,
    products: initialProducts,
    orders: generatedOrders,
    customers: initialCustomers,
    cashSessions: [initialCashSession],
    tables: initialTables,
    inventory: initialInventory,
    expenses: initialExpenses,
    staff: initialStaff,
    settings: initialSettings,
    priceAudits: [],
  };
}

const initialState = loadInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  categories: initialState.categories,
  products: initialState.products,
  orders: initialState.orders,
  customers: initialState.customers,
  cashSessions: initialState.cashSessions,
  tables: initialState.tables,
  inventory: initialState.inventory,
  expenses: initialState.expenses,
  staff: initialState.staff,
  settings: initialState.settings,
  priceAudits: initialState.priceAudits,

  currentUser: initialState.staff[0], // Inicia con Dueño para demostración fluida
  cart: [],
  activeNotification: null,
  lastActiveTimestamp: Date.now(),

  // --- AUTH & SEGURIDAD ---
  loginWithPin: (pin: string) => {
    const user = get().staff.find((s) => s.pin === pin && s.active);
    if (user) {
      set({ currentUser: user, lastActiveTimestamp: Date.now() });
      return true;
    }
    return false;
  },

  loginAsStaff: (staffId: string) => {
    const user = get().staff.find((s) => s.id === staffId);
    if (user) {
      set({ currentUser: user, lastActiveTimestamp: Date.now() });
    }
  },

  logout: () => {
    set({ currentUser: null });
  },

  updateActivity: () => {
    set({ lastActiveTimestamp: Date.now() });
  },

  // --- CARRITO ---
  addToCart: (item) => {
    // Si el producto no tiene precio base ni variantes, bloquear adición
    if (item.product.basePrice === null && (!item.product.variants || item.product.variants.length === 0)) {
      get().setNotification({
        message: 'Este plato no tiene precio asignado («Consultar precio»). No puede agregarse al pedido.',
        type: 'error',
      });
      return false;
    }

    const id = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const addonsTotal = item.addons.reduce((acc, a) => acc + a.price, 0);
    const unitPrice = item.unitPrice > 0 ? item.unitPrice : (item.product.basePrice ?? 0) + addonsTotal;
    const total = unitPrice * item.quantity;

    set((state) => ({
      cart: [...state.cart, { ...item, id, unitPrice, total }],
      activeNotification: {
        message: `Agregado al carrito: ${item.product.name}`,
        type: 'success',
      },
    }));
    return true;
  },

  updateCartItemQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.id === id) {
          const addonsTotal = item.addons.reduce((acc, a) => acc + a.price, 0);
          const base = item.product.basePrice ?? 0;
          const unitPrice = item.unitPrice > 0 ? item.unitPrice : base + addonsTotal;
          const total = unitPrice * quantity;
          return { ...item, quantity, total };
        }
        return item;
      }),
    }));
  },

  removeFromCart: (id) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  // --- PEDIDOS & CICLO DE VIDA ---
  createOrder: (orderData) => {
    const id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nextNum = get().orders.length + 101;
    const code = `CH-${String(nextNum).padStart(4, '0')}`;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      code,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [{ status: orderData.status || 'recibido', timestamp: nowIso, responsibleName: orderData.cashierName || 'Sistema' }],
    };

    // Si tiene pago inmediato en efectivo y hay caja abierta, registrar movimiento
    const currentSession = get().cashSessions.find((s) => s.status === 'abierta');
    if (currentSession) {
      const cashPayment = newOrder.payments.find((p) => p.method === 'efectivo');
      if (cashPayment && cashPayment.amount > 0) {
        get().addCashMovement({
          type: 'venta',
          amount: cashPayment.amount,
          method: 'efectivo',
          reason: `Venta pedido ${newOrder.code}`,
          cashierName: newOrder.cashierName || 'Cajero Mostrador',
          orderId: newOrder.id,
        });
      }
    }

    // Descuento automático de inventario por receta teórica
    newOrder.items.forEach((item) => {
      if (item.productId.startsWith('bg-')) {
        get().adjustInventoryStock('inv-carne-hamb', -0.15 * item.quantity);
        get().adjustInventoryStock('inv-pan-hamburguesa', -0.1 * item.quantity);
      } else if (item.productId.startsWith('sg-') || item.productId.startsWith('sj-')) {
        get().adjustInventoryStock('inv-papa-francesa', -0.2 * item.quantity);
      }
    });

    // Puntos de fidelidad
    if (newOrder.customer.id && get().settings.loyaltyPointsPer1000 > 0) {
      const pointsEarned = Math.floor(newOrder.total / 1000) * get().settings.loyaltyPointsPer1000;
      if (pointsEarned > 0) {
        get().addLoyaltyPoints(newOrder.customer.id, pointsEarned);
      }
    }

    // Si es fiado, acumular en el balance del cliente
    const fiadoPayment = newOrder.payments.find((p) => p.method === 'fiado');
    if (fiadoPayment && newOrder.customer.id) {
      const cust = get().customers.find((c) => c.id === newOrder.customer.id);
      if (cust) {
        get().updateCustomer(cust.id, {
          creditBalance: cust.creditBalance + fiadoPayment.amount,
          totalSpent: cust.totalSpent + newOrder.total,
          totalOrders: cust.totalOrders + 1,
        });
      }
    }

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    syncManager.broadcast({ type: 'ORDER_CREATED', orderCode: newOrder.code });
    return newOrder;
  },

  updateOrderStatus: (orderId, status, note, driverId, driverName) => {
    const nowIso = new Date().toISOString();
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id === orderId) {
          const updatedTimeline = [
            ...o.timeline,
            { status, timestamp: nowIso, note, responsibleName: state.currentUser?.name || 'Sistema' },
          ];
          return {
            ...o,
            status,
            driverId: driverId ?? o.driverId,
            driverName: driverName ?? o.driverName,
            updatedAt: nowIso,
            timeline: updatedTimeline,
          };
        }
        return o;
      }),
    }));

    syncManager.broadcast({ type: 'ORDER_STATUS_CHANGED', orderId, status });
  },

  cancelOrder: (orderId, reason, responsibleName) => {
    const nowIso = new Date().toISOString();
    const order = get().orders.find((o) => o.id === orderId);
    if (!order || order.status === 'cancelado') return;

    // 1. Si tenía pago en efectivo y hay caja abierta, registrar egreso de devolución
    const cashPayment = order.payments.find((p) => p.method === 'efectivo');
    const activeSession = get().cashSessions.find((s) => s.status === 'abierta');
    if (cashPayment && cashPayment.amount > 0 && activeSession) {
      get().addCashMovement({
        type: 'devolucion_cancelacion',
        amount: cashPayment.amount,
        method: 'efectivo',
        reason: `Devolución cancelación pedido ${order.code}: ${reason}`,
        cashierName: responsibleName || get().currentUser?.name || 'Administrador',
        orderId: order.id,
      });
    }

    // 2. Reabastecer inventario que se había descontado
    order.items.forEach((item) => {
      if (item.productId.startsWith('bg-')) {
        get().adjustInventoryStock('inv-carne-hamb', 0.15 * item.quantity);
        get().adjustInventoryStock('inv-pan-hamburguesa', 0.1 * item.quantity);
      } else if (item.productId.startsWith('sg-') || item.productId.startsWith('sj-')) {
        get().adjustInventoryStock('inv-papa-francesa', 0.2 * item.quantity);
      }
    });

    // 3. Revertir puntos de fidelidad otorgados
    if (order.customer.id && get().settings.loyaltyPointsPer1000 > 0) {
      const pointsReversed = Math.floor(order.total / 1000) * get().settings.loyaltyPointsPer1000;
      if (pointsReversed > 0) {
        get().addLoyaltyPoints(order.customer.id, -pointsReversed);
      }
    }

    // 4. Si fue cargado a fiado, descontar del balance del cliente
    const fiadoPayment = order.payments.find((p) => p.method === 'fiado');
    if (fiadoPayment && order.customer.id) {
      const cust = get().customers.find((c) => c.id === order.customer.id);
      if (cust) {
        get().updateCustomer(cust.id, {
          creditBalance: Math.max(0, cust.creditBalance - fiadoPayment.amount),
        });
      }
    }

    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelado',
            cancelReason: reason,
            cancelResponsible: responsibleName || state.currentUser?.name || 'Administrador',
            cancelledAt: nowIso,
            updatedAt: nowIso,
            timeline: [
              ...o.timeline,
              { status: 'cancelado', timestamp: nowIso, note: reason, responsibleName: responsibleName || 'Admin' },
            ],
          };
        }
        return o;
      }),
    }));

    syncManager.broadcast({ type: 'ORDER_STATUS_CHANGED', orderId, status: 'cancelado' });
  },

  toggleItemReady: (orderId, itemId) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item) =>
            item.id === itemId ? { ...item, readyInKitchen: !item.readyInKitchen } : item
          );
          return { ...o, items: updatedItems };
        }
        return o;
      }),
    }));
  },

  assignDriver: (orderId, driverId, driverName) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              driverId,
              driverName,
              status: o.status === 'listo' ? 'en_camino' : o.status,
            }
          : o
      ),
    }));
  },

  // --- PRODUCTOS ---
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      image: productData.image || getProductImage(productData),
    };
    set((state) => ({
      products: [newProduct, ...state.products],
    }));
    return newProduct;
  },

  updateProduct: (id, patch) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  toggleProductAvailable: (id) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, available: !p.available } : p)),
    }));
  },

  toggleProductPopular: (id) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, popular: !p.popular } : p)),
    }));
  },

  bulkAdjustPrices: (percentage, appliedBy) => {
    let affectedCount = 0;
    const multiplier = 1 + percentage / 100;

    set((state) => {
      const updatedProducts = state.products.map((p) => {
        if (p.basePrice === null) return p;
        affectedCount++;
        const newBase = Math.round((p.basePrice * multiplier) / 500) * 500;
        const newVariants = p.variants?.map((v) => ({
          ...v,
          price: Math.round((v.price * multiplier) / 500) * 500,
        }));
        return {
          ...p,
          basePrice: newBase,
          variants: newVariants,
        };
      });

      const audit: PriceAdjustmentAudit = {
        id: `audit-${Date.now()}`,
        date: new Date().toISOString(),
        percentage,
        appliedBy,
        affectedProductsCount: affectedCount,
      };

      return {
        products: updatedProducts,
        priceAudits: [audit, ...state.priceAudits],
      };
    });

    return {
      id: `audit-${Date.now()}`,
      date: new Date().toISOString(),
      percentage,
      appliedBy,
      affectedProductsCount: affectedCount,
    };
  },

  // --- CAJA & TURNOS ---
  openCashSession: (openedBy, initialFloat) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy,
      initialFloat,
      movements: [
        {
          id: `mov-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'ingreso',
          amount: initialFloat,
          method: 'efectivo',
          reason: 'Base de caja inicial de apertura',
          cashierName: openedBy,
        },
      ],
      status: 'abierta',
    };
    set((state) => ({
      cashSessions: [newSession, ...state.cashSessions],
    }));

    syncManager.broadcast({ type: 'CASH_SESSION_CHANGED', status: 'abierta' });
    return newSession;
  },

  addCashMovement: (movementData) => {
    const movement: CashMovement = {
      ...movementData,
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      cashSessions: state.cashSessions.map((session) => {
        if (session.status === 'abierta') {
          return {
            ...session,
            movements: [movement, ...session.movements],
          };
        }
        return session;
      }),
    }));
  },

  closeCashSession: (countedCash, closedBy, notes) => {
    set((state) => ({
      cashSessions: state.cashSessions.map((session) => {
        if (session.status === 'abierta') {
          const cashIn = session.movements
            .filter((m) => m.method === 'efectivo' && (m.type === 'ingreso' || m.type === 'venta' || m.type === 'abono_fiado'))
            .reduce((acc, m) => acc + m.amount, 0);
          const cashOut = session.movements
            .filter((m) => m.method === 'efectivo' && (m.type === 'egreso' || m.type === 'devolucion_cancelacion'))
            .reduce((acc, m) => acc + m.amount, 0);

          const expectedCash = cashIn - cashOut;
          const difference = countedCash - expectedCash;

          return {
            ...session,
            closedAt: new Date().toISOString(),
            closedBy,
            countedCash,
            expectedCash,
            difference,
            status: 'cerrada',
            notes,
          };
        }
        return session;
      }),
    }));

    syncManager.broadcast({ type: 'CASH_SESSION_CHANGED', status: 'cerrada' });
  },

  // --- MESAS ---
  updateTableStatus: (tableId, status, orderId, guestCount) => {
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            currentOrderId: orderId ?? t.currentOrderId,
            guestCount: guestCount ?? t.guestCount,
            openedAt: status === 'ocupada' && !t.openedAt ? new Date().toISOString() : t.openedAt,
          };
        }
        return t;
      }),
    }));
  },

  releaseTable: (tableId) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, status: 'disponible', currentOrderId: undefined, guestCount: 0, total: 0, openedAt: undefined }
          : t
      ),
    }));
  },

  // --- CLIENTES & FIADOS ---
  addCustomer: (data) => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 0,
      creditBalance: 0,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      customers: [newCustomer, ...state.customers],
    }));
    return newCustomer;
  },

  updateCustomer: (id, patch) => {
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  recordCreditPayment: (customerId, amount, method, cashierName) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newBalance = Math.max(0, customer.creditBalance - amount);
    get().updateCustomer(customerId, { creditBalance: newBalance });

    // Si el abono es en efectivo y hay caja abierta, registrar movimiento como 'abono_fiado' (NO duplica ventas)
    if (method === 'efectivo') {
      get().addCashMovement({
        type: 'abono_fiado',
        amount,
        method: 'efectivo',
        reason: `Abono a saldo fiado de ${customer.name}`,
        cashierName: cashierName || get().currentUser?.name || 'Cajero',
        customerId: customer.id,
      });
    }
  },

  addLoyaltyPoints: (customerId, points) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints + points) } : c
      ),
    }));
  },

  // --- INVENTARIO ---
  adjustInventoryStock: (id, delta) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, parseFloat((item.stock + delta).toFixed(2))) } : item
      ),
    }));
  },

  updateInventoryItem: (id, patch) => {
    set((state) => ({
      inventory: state.inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  },

  // --- GASTOS ---
  addExpense: (expenseData) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      registeredBy: get().currentUser?.name || 'Administrador',
    };

    if (newExpense.paymentMethod === 'efectivo') {
      get().addCashMovement({
        type: 'egreso',
        amount: newExpense.amount,
        method: 'efectivo',
        reason: `Gasto: ${newExpense.description} (${newExpense.provider})`,
        cashierName: get().currentUser?.name || 'Administrador',
      });
    }

    set((state) => ({
      expenses: [newExpense, ...state.expenses],
    }));
    return newExpense;
  },

  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

  // --- CONFIGURACIÓN & DEMO ---
  updateSettings: (patch) => {
    set((state) => {
      const updated = { ...state.settings, ...patch };
      if (patch.theme) {
        if (patch.theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
      return { settings: updated };
    });
  },

  toggleTheme: () => {
    const nextTheme = get().settings.theme === 'dark' ? 'light' : 'dark';
    get().updateSettings({ theme: nextTheme });
  },

  setNotification: (notification) => {
    set({ activeNotification: notification });
    if (notification) {
      setTimeout(() => {
        set({ activeNotification: null });
      }, 4000);
    }
  },

  resetToDemoData: () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    const newSeedOrders = generateSeedOrders();
    set({
      categories: categoriesData,
      products: initialProducts,
      orders: newSeedOrders,
      customers: initialCustomers,
      cashSessions: [initialCashSession],
      tables: initialTables,
      inventory: initialInventory,
      expenses: initialExpenses,
      staff: initialStaff,
      settings: initialSettings,
      priceAudits: [],
      cart: [],
      activeNotification: {
        message: '¡Datos demo de 60 días restablecidos con éxito!',
        type: 'success',
      },
    });

    syncManager.broadcast({ type: 'STATE_UPDATED' });
  },

  exportDatabaseJson: () => {
    const data: DatabaseBackup = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appName: 'CHAVES_BURGUER',
      categories: get().categories,
      products: get().products,
      orders: get().orders,
      customers: get().customers,
      cashSessions: get().cashSessions,
      tables: get().tables,
      inventory: get().inventory,
      expenses: get().expenses,
      staff: get().staff,
      settings: get().settings,
      priceAudits: get().priceAudits,
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJson: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as DatabaseBackup;

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'El archivo no contiene un JSON válido.' };
      }

      if (!parsed.products || !Array.isArray(parsed.products) || !parsed.orders || !Array.isArray(parsed.orders)) {
        return { success: false, error: 'Estructura incompatible: faltan colecciones esenciales (productos u órdenes).' };
      }

      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        return { success: false, error: 'Estructura incompatible: falta el listado de categorías.' };
      }

      set({
        categories: parsed.categories,
        products: parsed.products,
        orders: parsed.orders,
        customers: parsed.customers || [],
        cashSessions: parsed.cashSessions || [],
        tables: parsed.tables || initialTables,
        inventory: parsed.inventory || [],
        expenses: parsed.expenses || [],
        staff: parsed.staff || initialStaff,
        settings: { ...initialSettings, ...(parsed.settings || {}) },
        priceAudits: parsed.priceAudits || [],
      });

      syncManager.broadcast({ type: 'STATE_UPDATED' });
      return { success: true };
    } catch (err) {
      return { success: false, error: `Error de análisis JSON: ${err instanceof Error ? err.message : String(err)}` };
    }
  },
}));

// Auto-guardado en localStorage con manejo seguro de excepciones
if (typeof window !== 'undefined') {
  useAppStore.subscribe((state) => {
    const payload = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      categories: state.categories,
      products: state.products,
      orders: state.orders,
      customers: state.customers,
      cashSessions: state.cashSessions,
      tables: state.tables,
      inventory: state.inventory,
      expenses: state.expenses,
      staff: state.staff,
      settings: state.settings,
      priceAudits: state.priceAudits,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Límite de cuota o restricción de localStorage:', e);
    }
  });

  // Suscripción al BroadcastChannel de pestañas
  syncManager.subscribe((msg) => {
    if (msg.type === 'STATE_UPDATED' || msg.type === 'ORDER_CREATED' || msg.type === 'ORDER_STATUS_CHANGED') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          useAppStore.setState({
            categories: parsed.categories,
            products: parsed.products,
            orders: parsed.orders,
            customers: parsed.customers,
            cashSessions: parsed.cashSessions,
            tables: parsed.tables,
            inventory: parsed.inventory,
            expenses: parsed.expenses,
            settings: parsed.settings,
          });
        }
      } catch (err) {
        console.error('Error sincronizando estado entre pestañas:', err);
      }
    }
  });

  // Fallback con storage event
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        useAppStore.setState({
          categories: parsed.categories,
          products: parsed.products,
          orders: parsed.orders,
          customers: parsed.customers,
          cashSessions: parsed.cashSessions,
          tables: parsed.tables,
          inventory: parsed.inventory,
          expenses: parsed.expenses,
          settings: parsed.settings,
        });
      } catch (err) {
        console.error('Error sincronizando pestañas por evento storage:', err);
      }
    }
  });
}
