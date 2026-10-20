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
  const initialSrc = getProductImage(product);
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // Si la imagen actual falló y no era la de la categoría, intenta la de la categoría
    const fallbackSrc = getProductImage({ categoryId: product.categoryId, name: '' });
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-3 text-center border border-zinc-800">
        <span className="text-3xl select-none mb-1 drop-shadow-md">{categoryIcon}</span>
        <span className="text-[10px] font-bold text-zinc-400 line-clamp-1 uppercase tracking-wider">
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
