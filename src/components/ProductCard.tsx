import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, ShoppingCart, MessageCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
  compact?: boolean;
}

export default function ProductCard({ product, onAddToCart, onOpenAuth, compact = false }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { currentUser } = useAuth();

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser) {
      onAddToCart(product);
    } else {
      onOpenAuth();
    }
  };

  return (
    <Link 
      to={compact ? "#" : `/product/${product.id}`}
      onClick={compact ? (e) => { e.preventDefault(); onAddToCart && onAddToCart(product); } : undefined}
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${compact ? 'p-2 flex flex-row items-center min-h-[80px]' : ''}`}
      style={compact ? { minHeight: 80, maxWidth: 320 } : {}}
    >
      <div className={compact ? 'flex items-center gap-4' : 'grid lg:grid-cols-2 gap-6'}>
        {/* Image Gallery */}
        <div className={compact ? 'w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100' : 'aspect-w-4 aspect-h-5 w-full overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none bg-gray-100 relative'}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={compact ? 'w-full h-full object-cover object-center' : 'h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105'}
          />
        </div>
        {/* Product Info */}
        <div className={compact ? 'flex-1 min-w-0' : 'p-6 space-y-4'}>
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-base truncate' : 'text-xl'}`}>{product.name}</h3>
            {/* Only show description in full card, not compact */}
            {!compact && <p className="mt-2 text-gray-600 line-clamp-3">{product.description}</p>}
          </div>
          <div className={compact ? 'flex gap-2 mt-1' : 'flex flex-wrap gap-2'}>
            {product.size.slice(0, compact ? 2 : product.size.length).map(size => (
              <span 
                key={size}
                className={`border rounded-full text-xs font-medium px-2 py-0.5 ${compact ? '' : 'px-3 py-1 text-sm'}`}
              >
                {size}
              </span>
            ))}
            {compact && product.size.length > 2 && <span className="text-xs text-gray-400">+{product.size.length - 2} more</span>}
          </div>
          <div className={compact ? 'mt-1' : 'flex gap-3 pt-4'}>
            <span className="font-bold text-black">R {product.price.toFixed(2)}</span>
          </div>
          {/* Do not render tabs or extra info in compact mode */}
        </div>
      </div>
    </Link>
  );
}