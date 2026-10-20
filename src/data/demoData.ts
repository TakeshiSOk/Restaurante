import {
  Category,
  Product,
  Customer,
  Staff,
  DeliveryZone,
  InventoryItem,
  Expense,
  Order,
  CashSession,
  BusinessSettings,
  OrderItem,
  OrderStatus,
  OrderOrigin,
  PaymentMethod,
} from '../types';

// Pseudo-generador determinista para reproducibilidad
class SeededRandom {
  private seed: number;
  constructor(seed = 987654321) {
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

// 1. Categorías del Menú
export const demoCategories: Category[] = [
  {
    id: 'burgers',
    name: 'Hamburguesas',
    slug: 'burgers',
    icon: '🍔',
    description: 'Carne 100% de res a la parrilla, pan brioche artesanal y vegetales frescos',
    sortOrder: 1,
    gradient: 'from-amber-600 to-red-600',
  },
  {
    id: 'perros',
    name: 'Perros Calientes',
    slug: 'perros',
    icon: '🌭',
    description: 'Salchicha especial tipo americana, queso fundido, tocineta y ripio crocante',
    sortOrder: 2,
    gradient: 'from-orange-600 to-amber-600',
  },
  {
    id: 'salchipapas',
    name: 'Salchipapas',
    slug: 'salchipapas',
    icon: '🍟',
    description: 'Papas francesas o criollas doradas, carnes seleccionadas y abundante queso',
    sortOrder: 3,
    gradient: 'from-yellow-600 to-orange-700',
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    slug: 'bebidas',
    icon: '🥤',
    description: 'Gaseosas heladas, limonadas naturales y cervezas bien frías',
    sortOrder: 4,
    gradient: 'from-blue-600 to-cyan-700',
  },
  {
    id: 'adicionales',
    name: 'Adicionales',
    slug: 'adicionales',
    icon: '➕',
    description: 'Acompañamientos crujientes y porciones extra para potenciar tu pedido',
    sortOrder: 5,
    gradient: 'from-emerald-600 to-teal-700',
  },
];

// Grupos de adiciones estándar
const burgerAddonGroup = {
  id: 'adiciones-burgers',
  name: 'Adicionales & Toppings',
  minSelect: 0,
  maxSelect: 4,
  items: [
    { id: 'add-bacon', name: 'Tocineta Ahumada Crispy', price: 4500 },
    { id: 'add-cheese', name: 'Queso Costeño Gratinado', price: 4000 },
    { id: 'add-cheddar', name: 'Doble Queso Cheddar Americano', price: 3500 },
    { id: 'add-egg', name: 'Huevo Frito a la Plancha', price: 2500 },
    { id: 'add-caramelized', name: 'Cebolla Caramelizada al Vino', price: 2500 },
    { id: 'add-house-sauce', name: 'Salsa Especial de la Casa Extra', price: 1500 },
  ],
};

const potatoTypeAddonGroup = {
  id: 'tipo-papa-combo',
  name: 'Elige tu tipo de papa',
  minSelect: 1,
  maxSelect: 1,
  items: [
    { id: 'papa-francesa', name: 'Papa Francesa Tradicional', price: 0 },
    { id: 'papa-criolla', name: 'Papa Criolla Dorada', price: 0 },
  ],
};

// 2. Menú de 24 Productos (Precios en COP realistas y fotos de Unsplash)
export const demoProducts: Product[] = [
  // --- HAMBURGUESAS (6) ---
  {
    id: 'prod-bg-clasica',
    categoryId: 'burgers',
    name: 'Hamburguesa Clásica Artesanal',
    description: '150g de carne de res al carbón, queso cheddar, lechuga cogollo, tomate milano y salsa de la casa.',
    basePrice: 22000,
    available: true,
    popular: true,
    tags: ['Carne Res', 'Artesanal', 'Recomendada'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-clasica-sencilla', name: 'Sencilla (150g)', price: 22000 },
      { id: 'var-clasica-doble', name: 'Doble Carne (300g)', price: 30000 },
    ],
    addonGroups: [burgerAddonGroup],
  },
  {
    id: 'prod-bg-doble-bacon',
    categoryId: 'burgers',
    name: 'Doble Carne & Bacon BBQ',
    description: '300g de res a la parrilla con doble tocineta ahumada crocante, queso mozzarella y salsa BBQ ahumada.',
    basePrice: 32000,
    available: true,
    popular: true,
    tags: ['Más Vendida', '300g Carne', 'Tocineta'],
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-bacon-standard', name: 'Combo con Papas', price: 36000 },
      { id: 'var-bacon-solo', name: 'Solo Hamburguesa', price: 32000 },
    ],
    addonGroups: [burgerAddonGroup, potatoTypeAddonGroup],
  },
  {
    id: 'prod-bg-monster',
    categoryId: 'burgers',
    name: 'Monster Chaves Salvaje',
    description: 'Triple carne de res (450g), tocineta, huevo frito, aros de cebolla apanados y lluvia de queso fundido.',
    basePrice: 39000,
    available: true,
    popular: false,
    tags: ['Colosal', '450g', 'Para Valientes'],
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
    addonGroups: [burgerAddonGroup],
  },
  {
    id: 'prod-bg-pollo-crispy',
    categoryId: 'burgers',
    name: 'Chicken Crispy Especial',
    description: 'Pechuga de pollo apanada ultra crocante, ensalada coleslaw de la casa, pepinillos dulces y mayonesa chipotle.',
    basePrice: 24000,
    available: true,
    tags: ['Pollo Crispy', 'Crocante'],
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-pollo-sencillo', name: 'Sencilla (180g)', price: 24000 },
      { id: 'var-pollo-combo', name: 'Combo con Francesas & Gaseosa', price: 31000 },
    ],
    addonGroups: [burgerAddonGroup],
  },
  {
    id: 'prod-bg-hawaiana',
    categoryId: 'burgers',
    name: 'Burger Hawaiana Asada',
    description: 'Carne de res 150g, rodaja de piña asada al carbón con toque dulce, jamón ahumado y queso mozzarella derretido.',
    basePrice: 25000,
    available: true,
    tags: ['Piña Asada', 'Agridulce'],
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    addonGroups: [burgerAddonGroup],
  },
  {
    id: 'prod-bg-smash',
    categoryId: 'burgers',
    name: 'Smash Cheeseburger Doble',
    description: 'Dos discos de carne smash con costra caramelizada, cuádruple queso americano, cebolla finamente picada y salsa especial.',
    basePrice: 26000,
    available: true,
    popular: true,
    tags: ['Estilo Smash', 'Queso Extremo'],
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    addonGroups: [burgerAddonGroup],
  },

  // --- PERROS CALIENTES (4) ---
  {
    id: 'prod-hotdog-clasico',
    categoryId: 'perros',
    name: 'Perro Americano Clásico',
    description: 'Salchicha americana manguera, ripio de papa crocante, queso costeño rallado, tártara y piña casera.',
    basePrice: 15000,
    available: true,
    popular: true,
    tags: ['Clásico', 'Ripio Crocante'],
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-dog-normal', name: 'Tamaño Normal', price: 15000 },
      { id: 'var-dog-con-tocineta', name: 'Con Tocineta Picada', price: 18500 },
    ],
  },
  {
    id: 'prod-hotdog-suizo',
    categoryId: 'perros',
    name: 'Perro Suizo Especial',
    description: 'Salchicha suiza premium a la plancha, tocineta ahumada en tiras, doble queso gratinado, salsa de maíz tierno.',
    basePrice: 20000,
    available: true,
    popular: true,
    tags: ['Salchicha Suiza', 'Gratinado'],
    image: 'https://images.unsplash.com/photo-1627054234036-7c98c11e74a8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-hotdog-perrada',
    categoryId: 'perros',
    name: 'Súper Perrada Colombiana',
    description: 'Salchicha especial, pollo desmechado, tocineta, jamón, huevo de codorniz, queso costeño y salsas de la casa.',
    basePrice: 23000,
    available: true,
    tags: ['Pollo & Tocineta', 'Contundente'],
    image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-hotdog-hawaiano',
    categoryId: 'perros',
    name: 'Perro Hawaiano Gratinado',
    description: 'Salchicha americana, trozos de piña caramelizada, jamón artesanal, queso mozzarella derretido y ripio.',
    basePrice: 17000,
    available: true,
    tags: ['Piña & Queso'],
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  },

  // --- SALCHIPAPAS (5) ---
  {
    id: 'prod-salchipapa-jr',
    categoryId: 'salchipapas',
    name: 'Salchipapa Tradicional Jr',
    description: 'Porción personal generosa de papas a la francesa, salchicha picada dorada, salsa tártara y queso costeño rallado.',
    basePrice: 16000,
    available: true,
    tags: ['Personal', 'Tradicional'],
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    addonGroups: [potatoTypeAddonGroup],
  },
  {
    id: 'prod-salchipapa-mixta',
    categoryId: 'salchipapas',
    name: 'Salchipapa Mixta Especial',
    description: 'Cama de papas francesas y criollas, trozos de pollo a la plancha, carne de res desmechada, salchicha y queso fundido.',
    basePrice: 28000,
    available: true,
    popular: true,
    tags: ['Pollo & Res', 'Recomendada'],
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-salchi-mediana', name: 'Mediana (1-2 personas)', price: 28000 },
      { id: 'var-salchi-grande', name: 'Grande (2-3 personas)', price: 38000 },
    ],
  },
  {
    id: 'prod-salchipapa-chaves',
    categoryId: 'salchipapas',
    name: 'Salchipapa Salvaje Chaves',
    description: 'La consentida de la casa: papas mixtas, salchicha suiza, tocineta ahumada, costillitas desmechadas BBQ y baño de queso cheddar.',
    basePrice: 36000,
    available: true,
    popular: true,
    tags: ['Para Compartir', 'Costillitas BBQ'],
    image: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-salchipapa-costena',
    categoryId: 'salchipapas',
    name: 'Salchipapa Costeña con Suero',
    description: 'Papas criollas crocantes, butifarra frita, salchicha manguera, queso costeño frito en cubos y suero atollabuey.',
    basePrice: 27000,
    available: true,
    tags: ['Sabor Costeño', 'Butifarra & Suero'],
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-bandeja-familiar',
    categoryId: 'salchipapas',
    name: 'Bandeja Parrillera Familiar (3-4 Personas)',
    description: 'Bandeja gigante con 1kg de papas, carne de res, pechuga de pollo, salchicha manguera, chorizo antioqueño, arepitas y 4 gaseosas.',
    basePrice: 58000,
    available: true,
    tags: ['Bandeja Familiar', 'Para 4 personas'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },

  // --- BEBIDAS (5) ---
  {
    id: 'prod-beb-cocacola',
    categoryId: 'bebidas',
    name: 'Coca-Cola Original 400ml',
    description: 'Botella personal bien fría para acompañar tu comida.',
    basePrice: 5000,
    available: true,
    tags: ['Gaseosa'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-coca-400', name: 'Botella 400ml', price: 5000 },
      { id: 'var-coca-15', name: 'Mega 1.5 Litros', price: 9500 },
    ],
  },
  {
    id: 'prod-beb-postobon',
    categoryId: 'bebidas',
    name: 'Manzana Postobón 400ml',
    description: 'La gaseosa colombiana tradicional, servida helada.',
    basePrice: 4500,
    available: true,
    tags: ['Gaseosa'],
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-manzana-400', name: 'Botella 400ml', price: 4500 },
      { id: 'var-manzana-15', name: 'Mega 1.5 Litros', price: 8500 },
    ],
  },
  {
    id: 'prod-beb-limonada',
    categoryId: 'bebidas',
    name: 'Limonada Natural / Cerezada',
    description: 'Zumo de limón fresco recién exprimido con hielo frappé.',
    basePrice: 8000,
    available: true,
    popular: true,
    tags: ['Bebida Natural', 'Frappé'],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-limonada-natural', name: 'Limonada Natural', price: 8000 },
      { id: 'var-limonada-cerezada', name: 'Limonada Cerezada', price: 9500 },
      { id: 'var-limonada-coco', name: 'Limonada de Coco Cremosa', price: 11000 },
    ],
  },
  {
    id: 'prod-beb-jugo',
    categoryId: 'bebidas',
    name: 'Jugo Natural en Agua o Leche',
    description: 'Fruta 100% natural preparada al instante: Maracuyá, Mango, Fresa, Guanábana o Mora.',
    basePrice: 7500,
    available: true,
    tags: ['Fruta Natural'],
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-jugo-agua', name: 'En Agua', price: 7500 },
      { id: 'var-jugo-leche', name: 'En Leche Cremosa', price: 9000 },
    ],
  },
  {
    id: 'prod-beb-cerveza',
    categoryId: 'bebidas',
    name: 'Cerveza Club Colombia Dorada',
    description: 'Lata 330ml bien helada.',
    basePrice: 7000,
    available: true,
    tags: ['Cerveza'],
    image: 'https://images.unsplash.com/photo-1608270191590-e593d8b248a3?auto=format&fit=crop&w=800&q=80',
  },

  // --- ADICIONALES (4) ---
  {
    id: 'prod-add-papas',
    categoryId: 'adicionales',
    name: 'Porción de Papas Francesas Crocantes',
    description: 'Papas doraditas con sal parrillera y salsa de la casa.',
    basePrice: 7000,
    available: true,
    tags: ['Acompañamiento'],
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'var-papas-mediana', name: 'Porción Mediana', price: 7000 },
      { id: 'var-papas-grande', name: 'Porción Grande', price: 11000 },
    ],
  },
  {
    id: 'prod-add-aros',
    categoryId: 'adicionales',
    name: 'Aros de Cebolla Apanados (8 uds)',
    description: 'Crujientes aros de cebolla dorados servidos con salsa tártara de la casa.',
    basePrice: 9000,
    available: true,
    tags: ['Crocante'],
    image: 'https://images.unsplash.com/photo-1639024471287-032f6644dd40?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-add-tocineta',
    categoryId: 'adicionales',
    name: 'Porción de Tocineta Ahumada',
    description: 'Tiras de tocineta premium doradas al punto perfecto.',
    basePrice: 6000,
    available: true,
    tags: ['Extra'],
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-add-queso',
    categoryId: 'adicionales',
    name: 'Queso Costeño Gratinado Extra',
    description: 'Abundante queso costeño fundido a la plancha para coronar tus platos.',
    basePrice: 5000,
    available: true,
    tags: ['Extra Queso'],
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
  },
];

// 3. 18 Clientes Colombianos con Direcciones, Puntos y Fiados Realistas
export const demoCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Carlos Mario Londoño',
    phone: '3104529182',
    address: 'Calle 14 # 8-42, Apto 201',
    loyaltyPoints: 180,
    creditBalance: 48000, // Fiado pendiente
    totalOrders: 14,
    totalSpent: 420000,
    notes: 'Cliente frecuente de los viernes. Le gusta la salsa tártara aparte.',
    createdAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'cust-2',
    name: 'Marcela Quintero Peña',
    phone: '3157821902',
    address: 'Carrera 7 # 19-54, Barrio Bolívar',
    loyaltyPoints: 340,
    creditBalance: 0,
    totalOrders: 22,
    totalSpent: 690000,
    notes: 'Pide siempre domicilio con Nequi. Puntual.',
    createdAt: '2026-07-22T11:00:00Z',
  },
  {
    id: 'cust-3',
    name: 'Andrés Felipe Morales',
    phone: '3208761234',
    address: 'Cra 9 # 4-21, Casa de 2 pisos',
    loyaltyPoints: 95,
    creditBalance: 35000, // Fiado pendiente
    totalOrders: 8,
    totalSpent: 260000,
    notes: 'Fiado autorizado por el dueño (paga quincenal).',
    createdAt: '2026-09-02T19:20:00Z',
  },
  {
    id: 'cust-4',
    name: 'Valentina Ospina Gómez',
    phone: '3119827364',
    address: 'Calle 22 Norte # 5-18, Los Álamos',
    loyaltyPoints: 220,
    creditBalance: 0,
    totalOrders: 16,
    totalSpent: 510000,
    notes: 'Amante de las hamburguesas dobles con extra queso.',
    createdAt: '2026-08-15T20:10:00Z',
  },
  {
    id: 'cust-5',
    name: 'Juan David Henao',
    phone: '3146729018',
    address: 'Calle 5 # 12-45, Centro',
    loyaltyPoints: 60,
    creditBalance: 62000, // Fiado pendiente
    totalOrders: 6,
    totalSpent: 195000,
    notes: 'Vecino del local comercial. Fiado hasta fin de mes.',
    createdAt: '2026-09-12T13:40:00Z',
  },
  {
    id: 'cust-6',
    name: 'Camila Andrea Rincón',
    phone: '3128901243',
    address: 'Diagonal 18 # 2-80, El Prado',
    loyaltyPoints: 140,
    creditBalance: 0,
    totalOrders: 11,
    totalSpent: 360000,
    notes: 'Pide por la web para recoger en mostrador.',
    createdAt: '2026-08-28T18:15:00Z',
  },
  {
    id: 'cust-7',
    name: 'Mateo Botero Gil',
    phone: '3137894561',
    address: 'Cra 15 # 28-30, Ciudadela Nueva',
    loyaltyPoints: 310,
    creditBalance: 0,
    totalOrders: 19,
    totalSpent: 590000,
    notes: 'Siempre pide combo con gaseosa grande.',
    createdAt: '2026-07-30T21:00:00Z',
  },
  {
    id: 'cust-8',
    name: 'Sandra Milena Rojas',
    phone: '3182345678',
    address: 'Calle 10 # 14-12, Apto 402',
    loyaltyPoints: 85,
    creditBalance: 28000, // Fiado pendiente
    totalOrders: 7,
    totalSpent: 230000,
    notes: 'Profesora del colegio cercano. Abona los días 30.',
    createdAt: '2026-09-18T16:45:00Z',
  },
  {
    id: 'cust-9',
    name: 'Fabián Darío Vargas',
    phone: '3176543210',
    address: 'Transversal 6 # 15-90',
    loyaltyPoints: 45,
    creditBalance: 0,
    totalOrders: 5,
    totalSpent: 140000,
    createdAt: '2026-09-25T12:00:00Z',
  },
  {
    id: 'cust-10',
    name: 'Daniela Salazar Toro',
    phone: '3198765432',
    address: 'Cra 3 # 16-22',
    loyaltyPoints: 175,
    creditBalance: 0,
    totalOrders: 13,
    totalSpent: 395000,
    notes: 'Paga habitualmente por Daviplata.',
    createdAt: '2026-08-05T19:30:00Z',
  },
  {
    id: 'cust-11',
    name: 'Sebastián Cañas Ortiz',
    phone: '3109871234',
    address: 'Calle 13 # 9-60',
    loyaltyPoints: 200,
    creditBalance: 0,
    totalOrders: 15,
    totalSpent: 470000,
    createdAt: '2026-08-12T15:20:00Z',
  },
  {
    id: 'cust-12',
    name: 'Paola Andrea Jaramillo',
    phone: '3124567891',
    address: 'Calle 8 # 20-33, Urb. Los Pinos',
    loyaltyPoints: 120,
    creditBalance: 0,
    totalOrders: 9,
    totalSpent: 290000,
    createdAt: '2026-09-01T20:40:00Z',
  },
  {
    id: 'cust-13',
    name: 'Julián Esteban Marín',
    phone: '3156789123',
    address: 'Cra 11 # 1-50',
    loyaltyPoints: 390,
    creditBalance: 0,
    totalOrders: 25,
    totalSpent: 780000,
    notes: 'Supercliente VIP. Fanático de la Salchipapa Salvaje.',
    createdAt: '2026-07-15T18:00:00Z',
  },
  {
    id: 'cust-14',
    name: 'Nathalia Vélez Aguirre',
    phone: '3201234567',
    address: 'Calle 18 # 14-05',
    loyaltyPoints: 50,
    creditBalance: 52000, // Fiado pendiente
    totalOrders: 4,
    totalSpent: 160000,
    notes: 'Pendiente saldo de 2 hamburguesas especiales.',
    createdAt: '2026-09-28T19:10:00Z',
  },
  {
    id: 'cust-15',
    name: 'Diego Fernando Ruiz',
    phone: '3112345678',
    address: 'Cra 8 # 12-14',
    loyaltyPoints: 110,
    creditBalance: 0,
    totalOrders: 9,
    totalSpent: 275000,
    createdAt: '2026-09-08T13:10:00Z',
  },
  {
    id: 'cust-16',
    name: 'Gloria Patricia Sierra',
    phone: '3145678912',
    address: 'Calle 2 Norte # 7-88',
    loyaltyPoints: 160,
    creditBalance: 0,
    totalOrders: 12,
    totalSpent: 350000,
    createdAt: '2026-08-20T21:15:00Z',
  },
  {
    id: 'cust-17',
    name: 'Alejandro Giraldo',
    phone: '3187654321',
    address: 'Calle 16 # 6-40',
    loyaltyPoints: 75,
    creditBalance: 0,
    totalOrders: 6,
    totalSpent: 180000,
    createdAt: '2026-09-14T17:50:00Z',
  },
  {
    id: 'cust-18',
    name: 'Tatiana Muñoz Arango',
    phone: '3171234567',
    address: 'Cra 4 # 18-29, Apto 101',
    loyaltyPoints: 240,
    creditBalance: 0,
    totalOrders: 17,
    totalSpent: 530000,
    notes: 'Pide los fines de semana en familia.',
    createdAt: '2026-08-01T20:00:00Z',
  },
];

// 4. Personal del Restaurante (con 3 domiciliarios)
export const demoStaff: Staff[] = [
  { id: 'st-dueno', name: 'Albeiro Chaves (Dueño)', role: 'dueno', pin: '1234', phone: '3104567890', active: true },
  { id: 'st-cajero', name: 'Laura Restrepo (Cajera)', role: 'cajero', pin: '2024', phone: '3123456789', active: true },
  { id: 'st-cocina', name: 'Don Javier Gómez (Parrilla/Cocina)', role: 'cocinero', pin: '3030', phone: '3157891234', active: true },
  { id: 'st-domi-1', name: 'Brayan Sneider Ramos (Domi #1)', role: 'domiciliario', pin: '4040', phone: '3209876543', active: true, vehiclePlate: 'Moto Boxer CT100 - XRT 45E' },
  { id: 'st-domi-2', name: 'Yeison Stiven Gómez (Domi #2)', role: 'domiciliario', pin: '5050', phone: '3145678901', active: true, vehiclePlate: 'Moto NKD 125 - KLP 12F' },
  { id: 'st-domi-3', name: 'Cristian Camilo Mora (Domi #3)', role: 'domiciliario', pin: '6060', phone: '3187654321', active: true, vehiclePlate: 'Moto Pulsar NS200 - GHM 89D' },
  // Usuarios registrados inicialmente como clientes (pendientes de asignación de rol o comensales)
  { id: 'st-cli-1', name: 'Carlos Mendoza', role: 'cliente', pin: '1111', phone: '3114567890', email: 'carlos.mendoza@gmail.com', active: true, registeredAt: '2026-10-18T14:30:00Z' },
  { id: 'st-cli-2', name: 'Valentina Gómez', role: 'cliente', pin: '2222', phone: '3156789012', email: 'valen.gomez@hotmail.com', active: true, registeredAt: '2026-10-19T09:15:00Z' },
];

// 5. Zonas de Cobertura con Costos de Envío Realistas
export const demoDeliveryZones: DeliveryZone[] = [
  { id: 'zn-centro', name: 'Centro / Sector Histórico', cost: 3000, estimatedMinutes: 25, active: true },
  { id: 'zn-norte', name: 'Sector Norte / Los Álamos', cost: 4500, estimatedMinutes: 35, active: true },
  { id: 'zn-sur', name: 'Sector Sur / El Prado', cost: 5000, estimatedMinutes: 40, active: true },
  { id: 'zn-ciudadela', name: 'Ciudadela Nueva & Variante', cost: 6500, estimatedMinutes: 50, active: true },
];

// 6. Inventario con 12 Insumos (3 en Nivel Crítico para Alertas)
export const demoInventory: InventoryItem[] = [
  {
    id: 'inv-pan-brioche',
    name: 'Pan Brioche Artesanal Hamburguesa',
    unit: 'unidad',
    stock: 8, // CRÍTICO (mínimo 30)
    minStock: 30,
    costPerUnit: 1400,
    category: 'Panadería',
    lastRestocked: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-carne-res',
    name: 'Carne de Res Molida Premium 150g',
    unit: 'unidad',
    stock: 14, // CRÍTICO (mínimo 50)
    minStock: 50,
    costPerUnit: 5200,
    category: 'Carnes',
    lastRestocked: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'inv-papa-francesa',
    name: 'Papa a la Francesa McCain (Bolsas)',
    unit: 'paquete',
    stock: 5, // CRÍTICO (mínimo 20)
    minStock: 20,
    costPerUnit: 14500,
    category: 'Congelados',
    lastRestocked: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'inv-tocineta',
    name: 'Tocineta Ahumada Seleccionada',
    unit: 'kg',
    stock: 18,
    minStock: 6,
    costPerUnit: 26000,
    category: 'Carnes Frías',
    lastRestocked: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'inv-queso-mozzarella',
    name: 'Bloque Queso Mozzarella',
    unit: 'kg',
    stock: 15,
    minStock: 5,
    costPerUnit: 22000,
    category: 'Lácteos',
    lastRestocked: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'inv-queso-costeno',
    name: 'Queso Costeño Campesino',
    unit: 'kg',
    stock: 22,
    minStock: 8,
    costPerUnit: 19000,
    category: 'Lácteos',
    lastRestocked: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-salchicha-manguera',
    name: 'Salchicha Americana Especial',
    unit: 'paquete',
    stock: 28,
    minStock: 10,
    costPerUnit: 16000,
    category: 'Carnes Frías',
    lastRestocked: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'inv-papa-criolla',
    name: 'Papa Criolla Lavada Primera',
    unit: 'kg',
    stock: 35,
    minStock: 12,
    costPerUnit: 4500,
    category: 'Verduras',
    lastRestocked: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'inv-salsa-casa',
    name: 'Salsa Especial de la Casa Chaves',
    unit: 'litro',
    stock: 16,
    minStock: 5,
    costPerUnit: 8000,
    category: 'Salsas',
    lastRestocked: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-gaseosas',
    name: 'Gaseosas Personales 400ml Surtidas',
    unit: 'lata',
    stock: 84,
    minStock: 30,
    costPerUnit: 2800,
    category: 'Bebidas',
    lastRestocked: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'inv-empaques-burger',
    name: 'Cajas Térmicas para Hamburguesas',
    unit: 'paquete',
    stock: 140,
    minStock: 40,
    costPerUnit: 450,
    category: 'Desechables',
    lastRestocked: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'inv-bolsas-domi',
    name: 'Bolsas Kraft de Reparto con Asa',
    unit: 'paquete',
    stock: 190,
    minStock: 50,
    costPerUnit: 600,
    category: 'Desechables',
    lastRestocked: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// 7. Gastos Operativos de las Últimas 3-4 Semanas
export function getDemoExpenses(): Expense[] {
  const now = new Date();
  const daysAgo = (days: number, hour = 10) => {
    const d = new Date(now.getTime() - days * 86400000);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'exp-1',
      date: daysAgo(2, 11),
      category: 'proveedores',
      provider: 'Frigorífico Central del Valle',
      description: 'Compra de 30kg carne de res y 15kg tocineta ahumada',
      amount: 720000,
      paymentMethod: 'transferencia',
      registeredBy: 'Albeiro Chaves',
    },
    {
      id: 'exp-2',
      date: daysAgo(5, 9),
      category: 'proveedores',
      provider: 'Panificadora Los Trigos',
      description: 'Lote semanal de 300 panes brioche artesanales',
      amount: 390000,
      paymentMethod: 'efectivo',
      registeredBy: 'Laura Restrepo',
    },
    {
      id: 'exp-3',
      date: daysAgo(8, 15),
      category: 'servicios',
      provider: 'Alcanos de Colombia (Gas Natural)',
      description: 'Factura mensual gas natural industrial cocina',
      amount: 240000,
      paymentMethod: 'nequi',
      registeredBy: 'Albeiro Chaves',
    },
    {
      id: 'exp-4',
      date: daysAgo(12, 16),
      category: 'mantenimiento',
      provider: 'Técnico Refrigeración Frío Express',
      description: 'Mantenimiento preventivo de plancha y congelador horizontal',
      amount: 150000,
      paymentMethod: 'efectivo',
      registeredBy: 'Albeiro Chaves',
    },
    {
      id: 'exp-5',
      date: daysAgo(16, 10),
      category: 'proveedores',
      provider: 'Distribuidora Lácteos del Sur',
      description: 'Queso mozzarella en bloque y queso costeño campesino',
      amount: 460000,
      paymentMethod: 'transferencia',
      registeredBy: 'Albeiro Chaves',
    },
    {
      id: 'exp-6',
      date: daysAgo(19, 11),
      category: 'arriendo',
      provider: 'Inmobiliaria Central Popayán',
      description: 'Canon mensual de arrendamiento local comercial',
      amount: 1800000,
      paymentMethod: 'transferencia',
      registeredBy: 'Albeiro Chaves',
    },
    {
      id: 'exp-7',
      date: daysAgo(22, 14),
      category: 'servicios',
      provider: 'Compañía Energética de Occidente',
      description: 'Factura mensual de energía eléctrica',
      amount: 380000,
      paymentMethod: 'daviplata',
      registeredBy: 'Laura Restrepo',
    },
    {
      id: 'exp-8',
      date: daysAgo(26, 17),
      category: 'otros',
      provider: 'Empaques e Insumos Plásticos',
      description: 'Bolsas kraft, cajas térmicas para hamburguesa y servilletas',
      amount: 210000,
      paymentMethod: 'efectivo',
      registeredBy: 'Laura Restrepo',
    },
  ];
}

// 8. Turno de Caja Abierto Hoy
export function getDemoCashSession(): CashSession {
  const now = new Date();
  const openedTime = new Date(now);
  openedTime.setHours(11, 30, 0, 0);

  return {
    id: `caja-${now.toISOString().slice(0, 10)}`,
    openedAt: openedTime.toISOString(),
    openedBy: 'Laura Restrepo (Cajera)',
    initialFloat: 150000, // Base de caja en efectivo
    status: 'abierta',
    notes: 'Turno activo. Base contada en billetes de 10k, 5k y 2k.',
    movements: [
      {
        id: 'mov-base',
        timestamp: openedTime.toISOString(),
        type: 'ingreso',
        amount: 150000,
        method: 'efectivo',
        reason: 'Base inicial de apertura de caja',
        cashierName: 'Laura Restrepo',
      },
      {
        id: 'mov-abono-1',
        timestamp: new Date(openedTime.getTime() + 45 * 60000).toISOString(),
        type: 'abono_fiado',
        amount: 25000,
        method: 'efectivo',
        reason: 'Abono a saldo fiado de Andrés Felipe Morales',
        cashierName: 'Laura Restrepo',
        customerId: 'cust-3',
      },
    ],
  };
}

// 9. Configuración del Restaurante
export const demoSettings: BusinessSettings = {
  name: 'Chaves Burguer',
  tagline: 'Fast Food · Hamburguesas Artesanales & Sabor Colombiano',
  phone: '311 555 0192',
  whatsappNumber: '573115550192',
  address: 'Calle 14 # 8-42, Parque Principal',
  city: 'Popayán, Colombia',
  isOpen: true,
  scheduleText: 'Lunes a Domingo: 11:30 am - 11:00 pm',
  loyaltyPointsPer1000: 1,
  pointValueInCop: 50,
  theme: 'dark',
  deliveryZones: demoDeliveryZones,
  simulatedOrdersActive: false,
  printTicketHeader: 'CHAVES BURGUER\nNIT: 900.823.114-1\nIVA Regimen Simplificado\nCalle 14 # 8-42, Parque Principal',
  printTicketFooter: '¡Gracias por tu compra!\nSabor y Calidad Insuperables\nInstagram: @chavesburguer',
  inactivityTimeoutMinutes: 20,
};

// 10. Generador de 100 a 130 Pedidos Realistas de los Últimos 30 Días + Pedidos Activos de Hoy
export function generateDemoOrders(): Order[] {
  const rng = new SeededRandom(777);
  const orders: Order[] = [];
  const now = new Date();

  const origins: OrderOrigin[] = ['domicilio', 'mostrador', 'web', 'whatsapp'];
  const paymentMethods: PaymentMethod[] = ['efectivo', 'nequi', 'daviplata', 'tarjeta'];
  const drivers = [
    { id: 'st-domi-1', name: 'Brayan Sneider Ramos' },
    { id: 'st-domi-2', name: 'Yeison Stiven Gómez' },
    { id: 'st-domi-3', name: 'Cristian Camilo Mora' },
  ];

  let orderSequence = 210;

  // Generamos historial de los últimos 30 días
  for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
    const targetDate = new Date(now.getTime() - dayOffset * 86400000);
    const dayOfWeek = targetDate.getDay(); // 0 = Dom, 5 = Vie, 6 = Sáb
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

    // Fines de semana: 4 a 6 pedidos simulados por día en la demo, entre semana 2 a 4
    const dailyCount = isWeekend ? rng.range(4, 6) : rng.range(2, 4);

    for (let i = 0; i < dailyCount; i++) {
      orderSequence++;
      const code = `CH-${String(orderSequence).padStart(4, '0')}`;

      // Picos: Almuerzo (12 a 14) y Cena (18 a 22)
      const isLunch = rng.next() < 0.4;
      const hour = isLunch ? rng.range(12, 14) : rng.range(18, 21);
      const minute = rng.range(5, 55);

      const orderTime = new Date(targetDate);
      orderTime.setHours(hour, minute, 0, 0);
      const createdAt = orderTime.toISOString();

      const customer = rng.pick(demoCustomers);
      const origin = rng.pick(origins);
      const isDelivery = origin === 'domicilio' || (origin === 'web' && rng.next() > 0.4);
      const deliveryFee = isDelivery ? rng.pick([3000, 4500, 5000]) : 0;
      const paymentMethod = rng.pick(paymentMethods);

      // 1 a 3 productos por pedido
      const itemCount = rng.range(1, 3);
      const items: OrderItem[] = [];
      let subtotal = 0;

      for (let k = 0; k < itemCount; k++) {
        const prod = rng.pick(demoProducts);
        const qty = rng.range(1, 2);
        let unitPrice = prod.basePrice || 22000;
        let variantName: string | undefined;

        if (prod.variants && prod.variants.length > 0) {
          const v = rng.pick(prod.variants);
          unitPrice = v.price;
          variantName = v.name;
        }

        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;

        items.push({
          id: `item-${orderSequence}-${k}`,
          productId: prod.id,
          name: prod.name,
          variantName,
          addons: [],
          notes: k === 0 && rng.next() > 0.6 ? 'Sin cebolla y salsas aparte' : undefined,
          unitPrice,
          quantity: qty,
          total: itemTotal,
          readyInKitchen: true,
          station: prod.categoryId === 'burgers' ? 'parrilla' : prod.categoryId === 'bebidas' ? 'general' : 'freidora',
        });
      }

      const total = subtotal + deliveryFee;
      const isCash = paymentMethod === 'efectivo';
      const received = isCash ? Math.ceil(total / 10000) * 10000 : total;
      const change = isCash ? Math.max(0, received - total) : 0;

      // 96% de pedidos entregados con éxito, 4% cancelados
      const isCancelled = rng.next() < 0.04;
      const status: OrderStatus = isCancelled ? 'cancelado' : 'entregado';

      const assignedDriver = isDelivery ? rng.pick(drivers) : null;

      orders.push({
        id: `ord-hist-${orderSequence}`,
        code,
        origin: isDelivery ? 'domicilio' : origin,
        status,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: isDelivery ? customer.address : undefined,
          zoneName: isDelivery ? 'Centro / Sector Histórico' : undefined,
        },
        items,
        subtotal,
        discount: 0,
        deliveryFee,
        total,
        payments: [
          {
            method: paymentMethod,
            amount: total,
            receivedAmount: received,
            change,
          },
        ],
        timeline: [
          { status: 'recibido', timestamp: createdAt },
          { status: 'en_cocina', timestamp: new Date(orderTime.getTime() + 3 * 60000).toISOString() },
          { status: 'listo', timestamp: new Date(orderTime.getTime() + 16 * 60000).toISOString() },
          ...(status === 'entregado'
            ? [{ status: 'entregado' as OrderStatus, timestamp: new Date(orderTime.getTime() + 32 * 60000).toISOString() }]
            : [{ status: 'cancelado' as OrderStatus, timestamp: new Date(orderTime.getTime() + 8 * 60000).toISOString(), note: 'Cancelado por solicitud del cliente' }]),
        ],
        cashierId: 'st-cajero',
        cashierName: 'Laura Restrepo',
        driverId: assignedDriver?.id,
        driverName: assignedDriver?.name,
        createdAt,
        updatedAt: new Date(orderTime.getTime() + 35 * 60000).toISOString(),
      });
    }
  }

  // --- PEDIDOS DE HOY ---
  // A) 4 Pedidos ya entregados hoy (para que el reporte de ventas de hoy tenga cifras reales)
  const todayHour = (hour: number, minute: number) => {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const todayCompletedOrders: Order[] = [
    {
      id: `ord-today-1`,
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mostrador',
      status: 'entregado',
      customer: {
        id: 'cust-1',
        name: 'Carlos Mario Londoño',
        phone: '3104529182',
      },
      items: [
        {
          id: 'item-td-1',
          productId: 'prod-bg-clasica',
          name: 'Hamburguesa Clásica Artesanal',
          variantName: 'Sencilla (150g)',
          addons: [],
          unitPrice: 22000,
          quantity: 2,
          total: 44000,
          readyInKitchen: true,
          station: 'parrilla',
        },
        {
          id: 'item-td-2',
          productId: 'prod-beb-cocacola',
          name: 'Coca-Cola Original 400ml',
          variantName: 'Botella 400ml',
          addons: [],
          unitPrice: 5000,
          quantity: 2,
          total: 10000,
          readyInKitchen: true,
          station: 'general',
        },
      ],
      subtotal: 54000,
      discount: 0,
      deliveryFee: 0,
      total: 54000,
      payments: [{ method: 'efectivo', amount: 54000, receivedAmount: 60000, change: 6000 }],
      timeline: [
        { status: 'recibido', timestamp: todayHour(12, 10).toISOString() },
        { status: 'en_cocina', timestamp: todayHour(12, 13).toISOString() },
        { status: 'listo', timestamp: todayHour(12, 28).toISOString() },
        { status: 'entregado', timestamp: todayHour(12, 35).toISOString() },
      ],
      cashierName: 'Laura Restrepo',
      createdAt: todayHour(12, 10).toISOString(),
      updatedAt: todayHour(12, 35).toISOString(),
    },
    {
      id: `ord-today-2`,
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'domicilio',
      status: 'entregado',
      customer: {
        id: 'cust-2',
        name: 'Marcela Quintero Peña',
        phone: '3157821902',
        address: 'Carrera 7 # 19-54, Barrio Bolívar',
        zoneName: 'Centro / Sector Histórico',
      },
      items: [
        {
          id: 'item-td-3',
          productId: 'prod-salchipapa-mixta',
          name: 'Salchipapa Mixta Especial',
          variantName: 'Mediana (1-2 personas)',
          addons: [{ name: 'Queso Costeño Gratinado', price: 4000 }],
          unitPrice: 28000,
          quantity: 1,
          total: 32000,
          readyInKitchen: true,
          station: 'freidora',
        },
        {
          id: 'item-td-4',
          productId: 'prod-beb-limonada',
          name: 'Limonada Natural / Cerezada',
          variantName: 'Limonada Cerezada',
          addons: [],
          unitPrice: 9500,
          quantity: 1,
          total: 9500,
          readyInKitchen: true,
          station: 'general',
        },
      ],
      subtotal: 41500,
      discount: 0,
      deliveryFee: 3000,
      total: 44500,
      payments: [{ method: 'nequi', amount: 44500 }],
      timeline: [
        { status: 'recibido', timestamp: todayHour(12, 40).toISOString() },
        { status: 'en_cocina', timestamp: todayHour(12, 43).toISOString() },
        { status: 'listo', timestamp: todayHour(13, 2).toISOString() },
        { status: 'entregado', timestamp: todayHour(13, 25).toISOString() },
      ],
      cashierName: 'Laura Restrepo',
      driverName: 'Brayan Sneider Ramos',
      createdAt: todayHour(12, 40).toISOString(),
      updatedAt: todayHour(13, 25).toISOString(),
    },
    {
      id: `ord-today-3`,
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mostrador',
      status: 'entregado',
      customer: {
        id: 'cust-7',
        name: 'Mateo Botero Gil',
        phone: '3137894561',
      },
      items: [
        {
          id: 'item-td-5',
          productId: 'prod-bg-doble-bacon',
          name: 'Doble Carne & Bacon BBQ',
          variantName: 'Combo con Papas',
          addons: [],
          unitPrice: 36000,
          quantity: 1,
          total: 36000,
          readyInKitchen: true,
          station: 'parrilla',
        },
        {
          id: 'item-td-6',
          productId: 'prod-beb-postobon',
          name: 'Manzana Postobón 400ml',
          variantName: 'Botella 400ml',
          addons: [],
          unitPrice: 4500,
          quantity: 1,
          total: 4500,
          readyInKitchen: true,
          station: 'general',
        },
      ],
      subtotal: 40500,
      discount: 0,
      deliveryFee: 0,
      total: 40500,
      payments: [{ method: 'tarjeta', amount: 40500 }],
      timeline: [
        { status: 'recibido', timestamp: todayHour(13, 10).toISOString() },
        { status: 'en_cocina', timestamp: todayHour(13, 12).toISOString() },
        { status: 'listo', timestamp: todayHour(13, 26).toISOString() },
        { status: 'entregado', timestamp: todayHour(13, 30).toISOString() },
      ],
      cashierName: 'Laura Restrepo',
      createdAt: todayHour(13, 10).toISOString(),
      updatedAt: todayHour(13, 30).toISOString(),
    },
  ];

  // B) 4 Pedidos ACTIVOS DE ESTE MOMENTO (en distintos estados: recibido, en_cocina, listo, en_camino)
  const minAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

  const activeOrders: Order[] = [
    // 1. Recibido / Pendiente (hace 4 min)
    {
      id: 'ord-active-recibido',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'web',
      status: 'recibido',
      customer: {
        id: 'cust-4',
        name: 'Valentina Ospina Gómez',
        phone: '3119827364',
        address: 'Calle 22 Norte # 5-18, Los Álamos',
        zoneName: 'Sector Norte / Los Álamos',
      },
      items: [
        {
          id: 'act-it-1',
          productId: 'prod-bg-smash',
          name: 'Smash Cheeseburger Doble',
          addons: [{ name: 'Tocineta Ahumada Crispy', price: 4500 }],
          notes: 'Sin pepinillos por favor, gracias',
          unitPrice: 26000,
          quantity: 1,
          total: 30500,
          readyInKitchen: false,
          station: 'parrilla',
        },
        {
          id: 'act-it-2',
          productId: 'prod-add-papas',
          name: 'Porción de Papas Francesas Crocantes',
          variantName: 'Porción Mediana',
          addons: [],
          unitPrice: 7000,
          quantity: 1,
          total: 7000,
          readyInKitchen: false,
          station: 'freidora',
        },
        {
          id: 'act-it-3',
          productId: 'prod-beb-cocacola',
          name: 'Coca-Cola Original 400ml',
          variantName: 'Botella 400ml',
          addons: [],
          unitPrice: 5000,
          quantity: 1,
          total: 5000,
          readyInKitchen: false,
          station: 'general',
        },
      ],
      subtotal: 42500,
      discount: 0,
      deliveryFee: 4500,
      total: 47000,
      payments: [{ method: 'nequi', amount: 47000 }],
      timeline: [{ status: 'recibido', timestamp: minAgo(4) }],
      notes: 'Casa blanca de portón negro',
      createdAt: minAgo(4),
      updatedAt: minAgo(4),
    },
    // 2. En Cocina (hace 11 min)
    {
      id: 'ord-active-cocina-1',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mostrador',
      status: 'en_cocina',
      customer: {
        id: 'cust-13',
        name: 'Julián Esteban Marín',
        phone: '3156789123',
      },
      items: [
        {
          id: 'act-it-4',
          productId: 'prod-salchipapa-chaves',
          name: 'Salchipapa Salvaje Chaves',
          addons: [{ name: 'Queso Costeño Gratinado', price: 4000 }],
          notes: 'Bien doradita la tocineta y bastante salsa de la casa',
          unitPrice: 36000,
          quantity: 1,
          total: 40000,
          readyInKitchen: false,
          station: 'freidora',
        },
        {
          id: 'act-it-5',
          productId: 'prod-beb-cerveza',
          name: 'Cerveza Club Colombia Dorada',
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
        { status: 'recibido', timestamp: minAgo(14) },
        { status: 'en_cocina', timestamp: minAgo(11) },
      ],
      cashierName: 'Laura Restrepo',
      createdAt: minAgo(14),
      updatedAt: minAgo(11),
    },
    // 3. Listo para empacar o entregar (hace 18 min)
    {
      id: 'ord-active-listo',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'mostrador',
      status: 'listo',
      customer: {
        id: 'cust-10',
        name: 'Daniela Salazar Toro',
        phone: '3198765432',
      },
      items: [
        {
          id: 'act-it-6',
          productId: 'prod-hotdog-suizo',
          name: 'Perro Suizo Especial',
          addons: [],
          unitPrice: 20000,
          quantity: 1,
          total: 20000,
          readyInKitchen: true,
          station: 'parrilla',
        },
        {
          id: 'act-it-7',
          productId: 'prod-bg-clasica',
          name: 'Hamburguesa Clásica Artesanal',
          variantName: 'Sencilla (150g)',
          addons: [],
          unitPrice: 22000,
          quantity: 1,
          total: 22000,
          readyInKitchen: true,
          station: 'parrilla',
        },
      ],
      subtotal: 42000,
      discount: 0,
      deliveryFee: 0,
      total: 42000,
      payments: [{ method: 'efectivo', amount: 42000, receivedAmount: 50000, change: 8000 }],
      timeline: [
        { status: 'recibido', timestamp: minAgo(22) },
        { status: 'en_cocina', timestamp: minAgo(19) },
        { status: 'listo', timestamp: minAgo(3) },
      ],
      cashierName: 'Laura Restrepo',
      createdAt: minAgo(22),
      updatedAt: minAgo(3),
    },
    // 4. En Camino con Domiciliario (hace 26 min)
    {
      id: 'ord-active-en-camino',
      code: `CH-${String(++orderSequence).padStart(4, '0')}`,
      origin: 'domicilio',
      status: 'en_camino',
      customer: {
        id: 'cust-6',
        name: 'Camila Andrea Rincón',
        phone: '3128901243',
        address: 'Diagonal 18 # 2-80, El Prado',
        zoneName: 'Sector Sur / El Prado',
      },
      items: [
        {
          id: 'act-it-8',
          productId: 'prod-bg-doble-bacon',
          name: 'Doble Carne & Bacon BBQ',
          variantName: 'Combo con Papas',
          addons: [],
          unitPrice: 36000,
          quantity: 1,
          total: 36000,
          readyInKitchen: true,
          station: 'parrilla',
        },
        {
          id: 'act-it-9',
          productId: 'prod-beb-limonada',
          name: 'Limonada Natural / Cerezada',
          variantName: 'Limonada de Coco Cremosa',
          addons: [],
          unitPrice: 11000,
          quantity: 1,
          total: 11000,
          readyInKitchen: true,
          station: 'general',
        },
      ],
      subtotal: 47000,
      discount: 0,
      deliveryFee: 5000,
      total: 52000,
      payments: [{ method: 'efectivo', amount: 52000, receivedAmount: 60000, change: 8000 }],
      timeline: [
        { status: 'recibido', timestamp: minAgo(26) },
        { status: 'en_cocina', timestamp: minAgo(22) },
        { status: 'listo', timestamp: minAgo(10) },
        { status: 'en_camino', timestamp: minAgo(6), responsibleName: 'Brayan Sneider Ramos' },
      ],
      cashierName: 'Laura Restrepo',
      driverId: 'st-domi-1',
      driverName: 'Brayan Sneider Ramos',
      notes: 'Paga en efectivo con billete de $50k y $10k. Llevar vueltas de $8k.',
      createdAt: minAgo(26),
      updatedAt: minAgo(6),
    },
  ];

  return [...orders, ...todayCompletedOrders, ...activeOrders];
}

// 11. Función Maestra para Obtener el Paquete Completo de Datos Demo
export function getCompleteDemoData() {
  const categories = demoCategories;
  const products = demoProducts;
  const customers = demoCustomers;
  const staff = demoStaff;
  const deliveryZones = demoDeliveryZones;
  const inventory = demoInventory;
  const expenses = getDemoExpenses();
  const cashSession = getDemoCashSession();
  const settings: BusinessSettings = {
    ...demoSettings,
    deliveryZones,
  };
  const orders = generateDemoOrders();

  return {
    categories,
    products,
    customers,
    staff,
    deliveryZones,
    inventory,
    expenses,
    cashSessions: [cashSession],
    settings,
    orders,
    tables: [],
  };
}
