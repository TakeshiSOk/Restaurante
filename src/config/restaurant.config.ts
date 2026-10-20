// ============================================================================
// CONFIGURACIÓN CENTRAL DE MARCA BLANCA (WHITE-LABEL CONFIG)
// ============================================================================
// Este archivo controla la identidad completa del restaurante.
// Para desplegar esta plantilla para un nuevo cliente, simplemente modifica
// los valores de abajo o selecciona uno de los presets preconfigurados.
// ============================================================================

export interface RestaurantConfig {
  // Identidad comercial
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  heroBadge: string;
  heroHeadline: string;
  legalName?: string;
  nit?: string;
  logoUrl?: string; // Ruta a imagen o vacío para usar el emblema vectorial generado

  // Paleta de Colores (se inyecta automáticamente en variables CSS)
  theme: {
    primaryColor: string;    // Color principal (botones clave, acentos)
    secondaryColor: string;  // Color secundario (badges, avisos, precios)
    darkBg?: string;         // Fondo base
    surfaceBg?: string;      // Fondo de tarjetas y barras
  };

  // Contacto & Canales de Venta
  contact: {
    phone: string;
    whatsappNumber: string;  // Con indicativo de país sin signos, ej: 573115550192
    address: string;
    city: string;
    scheduleText: string;
    instagram?: string;
  };

  // Mensajes de Ticket Térmico POS
  ticket: {
    header: string;
    footer: string;
  };

  // Módulos y funcionalidades activas (para vender planes Básico vs Pro)
  features: {
    enableDeliveryTracking: boolean; // Seguimiento en vivo de domicilios
    enableTableOrders: boolean;      // Pedidos a la mesa con QR
    enableKitchenKds: boolean;       // Pantalla táctil de cocina
    enableCashManagement: boolean;   // Arqueo y turnos de caja POS
    enableLoyaltyPoints: boolean;    // Programa de fidelización de clientes
    enableCustomerCredit: boolean;   // Fiados y cuentas corrientes
  };

  // Configuración de fidelización y turnos
  loyalty: {
    pointsPer1000: number; // Puntos otorgados por cada $1.000 COP
    pointValueInCop: number; // Valor de canje de cada punto
  };
}

// ----------------------------------------------------------------------------
// PRESET 1: Chaves Burguer (Fast Food · Parrilla · Hamburguesas y Salchipapas)
// ----------------------------------------------------------------------------
export const chavesBurguerPreset: RestaurantConfig = {
  id: 'chaves-burguer',
  name: 'Chaves Burguer',
  shortName: 'CHAVES',
  tagline: 'Fast Food · Hamburguesas Artesanales & Sabor Colombiano',
  heroBadge: 'Sabor casero & porciones monumentales',
  heroHeadline: '¡Pide en línea y disfruta de la mejor comida rápida artesanal!',
  legalName: 'Chaves Burguer S.A.S.',
  nit: '900.823.114-1',
  theme: {
    primaryColor: '#B91C1C',    // Rojo parrillero
    secondaryColor: '#F59E0B',  // Ámbar fuego
  },
  contact: {
    phone: '311 555 0192',
    whatsappNumber: '573115550192',
    address: 'Calle 14 # 8-42, Parque Principal',
    city: 'Colombia',
    scheduleText: 'Lunes a Domingo: 11:30 am - 11:00 pm',
    instagram: '@chavesburguer',
  },
  ticket: {
    header: 'CHAVES BURGUER\nNIT: 900.823.114-1\nRegimen Simplificado',
    footer: '¡Gracias por su compra!\nCalidad y Sabor Insuperable\nInstagram: @chavesburguer',
  },
  features: {
    enableDeliveryTracking: true,
    enableTableOrders: true,
    enableKitchenKds: true,
    enableCashManagement: true,
    enableLoyaltyPoints: true,
    enableCustomerCredit: true,
  },
  loyalty: {
    pointsPer1000: 1,
    pointValueInCop: 50,
  },
};

// ----------------------------------------------------------------------------
// PRESET 2: Tacos & Parrilla El Patrón (Taquería Mexicana & Asados)
// ----------------------------------------------------------------------------
export const tacosElPatronPreset: RestaurantConfig = {
  id: 'el-patron',
  name: 'Tacos El Patrón',
  shortName: 'EL PATRÓN',
  tagline: 'Auténtica Taquería Mexicana & Asados al Carbón',
  heroBadge: 'Tortillas a mano & Birria tradicional',
  heroHeadline: '¡El verdadero sabor mexicano directo a tu mesa o a tu casa!',
  legalName: 'Taquería El Patrón S.A.S.',
  nit: '901.442.890-3',
  theme: {
    primaryColor: '#16A34A',    // Verde mexicano esmeralda
    secondaryColor: '#EA580C',  // Naranja chile
  },
  contact: {
    phone: '320 888 1234',
    whatsappNumber: '573208881234',
    address: 'Cra 15 # 85-30, Zona Gastronómica',
    city: 'Colombia',
    scheduleText: 'Martes a Domingo: 12:00 pm - 11:30 pm',
    instagram: '@tacoselpatron',
  },
  ticket: {
    header: 'TACOS EL PATRÓN\nNIT: 901.442.890-3\nSabor Auténtico',
    footer: '¡Gracias por visitarnos!\n¡Viva México Cabrones!\nInstagram: @tacoselpatron',
  },
  features: {
    enableDeliveryTracking: true,
    enableTableOrders: true,
    enableKitchenKds: true,
    enableCashManagement: true,
    enableLoyaltyPoints: true,
    enableCustomerCredit: false,
  },
  loyalty: {
    pointsPer1000: 2,
    pointValueInCop: 40,
  },
};

// ----------------------------------------------------------------------------
// PRESET 3: La Piazza Trattoria (Pizzería Artesanal & Pastas Italianas)
// ----------------------------------------------------------------------------
export const laPiazzaPreset: RestaurantConfig = {
  id: 'la-piazza',
  name: 'La Piazza Trattoria',
  shortName: 'LA PIAZZA',
  tagline: 'Pizzas al Horno de Leña & Cocina Rústica Italiana',
  heroBadge: 'Masa madre con 48h de fermentación',
  heroHeadline: 'Pizzas crujientes y pastas artesanales recién horneadas.',
  legalName: 'La Piazza Trattoria S.A.S.',
  nit: '900.312.789-8',
  theme: {
    primaryColor: '#881337',    // Vino tinto italiano
    secondaryColor: '#CA8A04',  // Mostaza dorada
  },
  contact: {
    phone: '315 777 4567',
    whatsappNumber: '573157774567',
    address: 'Calle 9 # 14-20, Centro Histórico',
    city: 'Colombia',
    scheduleText: 'Miércoles a Domingo: 1:00 pm - 10:30 pm',
    instagram: '@lapiazzatrattoria',
  },
  ticket: {
    header: 'LA PIAZZA TRATTORIA\nNIT: 900.312.789-8\nPizzería & Café',
    footer: '¡Grazie per la vostra visita!\nBuon Appetito!\nInstagram: @lapiazzatrattoria',
  },
  features: {
    enableDeliveryTracking: true,
    enableTableOrders: true,
    enableKitchenKds: true,
    enableCashManagement: true,
    enableLoyaltyPoints: true,
    enableCustomerCredit: false,
  },
  loyalty: {
    pointsPer1000: 1,
    pointValueInCop: 60,
  },
};

// ============================================================================
// CONFIGURACIÓN ACTIVA:
// Cambia esta variable para transformar toda la app a otro restaurante.
// ============================================================================
export const currentRestaurantConfig: RestaurantConfig = chavesBurguerPreset;

// Lista de presets disponibles para demostraciones comerciales
export const AVAILABLE_PRESETS: RestaurantConfig[] = [
  chavesBurguerPreset,
  tacosElPatronPreset,
  laPiazzaPreset,
];
