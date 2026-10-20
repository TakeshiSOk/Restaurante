import React from 'react';
import { useAppStore } from '../../store/useAppStore';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const settings = useAppStore((s) => s.settings);

  const sizeMap = {
    sm: { svg: 36, title: 'text-lg', tag: 'text-[9px]' },
    md: { svg: 52, title: 'text-2xl', tag: 'text-[10px]' },
    lg: { svg: 76, title: 'text-3xl', tag: 'text-xs' },
    xl: { svg: 100, title: 'text-4xl', tag: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  const nameParts = (settings?.name || 'Chaves Burguer').trim().split(' ');
  const firstWord = nameParts[0] || 'CHAVES';
  const restOfName = nameParts.slice(1).join(' ') || '';
  const displayTagline = settings?.tagline || 'Fast Food · Restaurant · Drink';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image or SVG Emblem */}
      {settings?.logoUrl ? (
        <div className="relative flex-shrink-0 drop-shadow-md">
          <img
            src={settings.logoUrl}
            alt={settings.name || 'Logo'}
            style={{ width: currentSize.svg, height: currentSize.svg }}
            className="rounded-xl object-contain bg-black/40 border border-brand-border/60 p-0.5 transition-transform hover:scale-105"
          />
        </div>
      ) : (
        <div className="relative flex-shrink-0 drop-shadow-md">
          <svg
            width={currentSize.svg}
            height={currentSize.svg}
            viewBox="0 0 100 100"
            className="transition-transform hover:scale-105"
          >
            <defs>
              <linearGradient id="bunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-secondary, #F59E0B)" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--brand-primary, #DC2626)" />
                <stop offset="50%" stopColor="var(--brand-primary, #B91C1C)" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="badgeRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-secondary, #F59E0B)" />
                <stop offset="50%" stopColor="var(--brand-primary, #DC2626)" />
                <stop offset="100%" stopColor="var(--brand-secondary, #F59E0B)" />
              </linearGradient>
            </defs>

            {/* Fondo circular carbón */}
            <circle cx="50" cy="50" r="47" fill="#1C1917" stroke="url(#badgeRing)" strokeWidth="2.5" />

            {/* Pan Superior */}
            <path d="M 22 41 A 28 23 0 0 1 78 41 Z" fill="url(#bunGrad)" />
            {/* Ajonjolí */}
            <circle cx="36" cy="29" r="1.5" fill="#FFF4E0" opacity="0.9" />
            <circle cx="50" cy="25" r="1.5" fill="#FFF4E0" opacity="0.9" />
            <circle cx="64" cy="29" r="1.5" fill="#FFF4E0" opacity="0.9" />
            <circle cx="43" cy="34" r="1.5" fill="#FFF4E0" opacity="0.9" />
            <circle cx="58" cy="34" r="1.5" fill="#FFF4E0" opacity="0.9" />

            {/* Lechuga rizada */}
            <path
              d="M 20 43 Q 28 48 35 43 Q 43 48 50 43 Q 57 48 65 43 Q 73 48 80 43"
              fill="none"
              stroke="#22C55E"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Queso derretido */}
            <path d="M 23 46 L 77 46 L 73 51 L 65 48 L 55 53 L 45 48 L 33 52 L 23 46 Z" fill="var(--brand-secondary, #F59E0B)" />

            {/* Carne asada artesanal */}
            <rect x="22" y="49" width="56" height="7" rx="3.5" fill="#5A2E16" />

            {/* Cinta Roja de Marca con extremos cortados */}
            <path d="M 10 59 L 90 59 L 84 73 L 16 73 Z" fill="url(#ribbonGrad)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))" />
            {/* Detalle dorado en la cinta */}
            <line x1="12" y1="61" x2="88" y2="61" stroke="#FBBF24" strokeWidth="0.8" opacity="0.8" />
            <line x1="17" y1="71" x2="83" y2="71" stroke="#FBBF24" strokeWidth="0.8" opacity="0.8" />
            
            <text
              x="50"
              y="69.5"
              textAnchor="middle"
              fill="#FFF4E0"
              fontFamily="'Impact', 'Arial Black', sans-serif"
              fontWeight="900"
              fontSize="11.5"
              letterSpacing="2"
            >
              {firstWord.slice(0, 8)}
            </text>

            {/* Pan Inferior */}
            <path d="M 26 75 Q 50 82 74 75 Z" fill="url(#bunGrad)" />
          </svg>
        </div>
      )}

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`font-display font-black tracking-wider text-brand-cream uppercase drop-shadow-sm ${currentSize.title}`}>
            {firstWord}
          </span>
          {restOfName && (
            <span className={`font-display font-black tracking-wider text-brand-orange uppercase ${currentSize.title}`}>
              {restOfName}
            </span>
          )}
        </div>
        {showTagline && (
          <span className={`font-medium tracking-widest text-brand-cream/70 uppercase mt-0.5 ${currentSize.tag}`}>
            {displayTagline}
          </span>
        )}
      </div>
    </div>
  );
};
