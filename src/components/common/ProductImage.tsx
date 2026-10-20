import React, { useState } from 'react';
import { getProductImage } from '../../lib/utils';

interface ProductImageProps {
  product: { categoryId: string; image?: string; name?: string };
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  categoryIcon?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
  categoryIcon = '🍔',
}) => {
  const initialSrc = product.image || getProductImage(product);
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  // Si no tiene imagen definida en el producto
  const hasCustomImage = Boolean(product.image && product.image.trim() !== '');

  const handleError = () => {
    setHasError(true);
  };

  if (!hasCustomImage || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1E1A16] via-[#26201B] to-[#151210] flex flex-col items-center justify-center p-3 text-center border border-zinc-800/80 select-none group-hover:scale-105 transition-transform duration-300">
        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-inner mb-1.5">
          <span className="text-2xl drop-shadow-sm">{categoryIcon || '🍽️'}</span>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 line-clamp-1 uppercase tracking-wider px-2">
          {product.name || 'Chaves Burguer'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
};
