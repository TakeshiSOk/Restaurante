import { BusinessSettings } from '../types';

export interface BrandPalette {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  preview: [string, string];
}

export const BRAND_PALETTES: BrandPalette[] = [
  {
    id: 'fuego-parrillero',
    name: 'Fuego Parrillero (Rojo & Naranja)',
    primaryColor: '#B91C1C',
    secondaryColor: '#F59E0B',
    preview: ['#B91C1C', '#F59E0B'],
  },
  {
    id: 'smash-gold',
    name: 'Smash Gold (Ámbar & Dorado)',
    primaryColor: '#D97706',
    secondaryColor: '#EAB308',
    preview: ['#D97706', '#EAB308'],
  },
  {
    id: 'american-diner',
    name: 'American Diner (Rojo & Azul)',
    primaryColor: '#DC2626',
    secondaryColor: '#2563EB',
    preview: ['#DC2626', '#2563EB'],
  },
  {
    id: 'gourmet-wine',
    name: 'Gourmet Steak (Vino & Mostaza)',
    primaryColor: '#881337',
    secondaryColor: '#CA8A04',
    preview: ['#881337', '#CA8A04'],
  },
  {
    id: 'fastfood-emerald',
    name: 'Fast Food Esmeralda (Verde & Naranja)',
    primaryColor: '#059669',
    secondaryColor: '#EA580C',
    preview: ['#059669', '#EA580C'],
  },
];

export function applyBrandTheme(settings: BusinessSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const primary = settings.primaryColor || '#B91C1C';
  const secondary = settings.secondaryColor || '#F59E0B';

  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', secondary);

  if (settings.name) {
    document.title = `${settings.name} | Sabor & Calidad`;
  }
}
