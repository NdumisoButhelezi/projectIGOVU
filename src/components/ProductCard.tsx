import React, { useState } from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
  compact?: boolean;
}

export default function ProductCard({ product, onAddToCart, onOpenAuth, compact = false }: ProductCardProps) {
  const { currentUser } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser) {
      onAddToCart(product);
    } else {
      onOpenAuth();
    }
  };

  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/300x300?text=No+Image';

  // Safe size handling - check both 'sizes' and 'size' fields
  const sizes: string[] = Array.isArray((product as any).sizes)
    ? (product as any).sizes
    : Array.isArray((product as any).size)
      ? (product as any).size
      : [];

  return (
    <Link 
      to={compact ? "#" : `/product/${product.id}`}
      onClick={compact ? (e) => { e.preventDefault(); onAddToCart && onAddToCart(product); } : undefined}
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        compact ? 'p-4 flex flex-row items-start gap-4 min-h-[140px]' : 'p-4'
      }`}
    >
      <div className={compact ? 'flex gap-4 w-full' : 'space-y-4'}>
        {/* Image */}
        <div className={compact ? 'w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100' : 'aspect-square w-full overflow-hidden rounded-xl bg-gray-100 relative'}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          {/* Image count indicator for multiple images */}
          {!compact && Array.isArray(product.images) && product.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
              +{product.images.length - 1}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={compact ? 'flex-1 min-w-0 space-y-3' : 'space-y-4'}>
          {/* Title and Description */}
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-lg mb-1' : 'text-xl mb-2'}`}>
              {product.name}
            </h3>
            {/* Show description in both compact and full view */}
            <p className={`text-gray-600 ${compact ? 'text-sm line-clamp-2' : 'text-sm line-clamp-3'}`}>
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className={`font-bold text-black ${compact ? 'text-xl' : 'text-2xl'}`}>
              R {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">incl. VAT</span>
          </div>

          {/* Available Sizes */}
          {sizes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Sizes:</h4>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map(size => (
                  <div 
                    key={size}
                    className="bg-gray-100 border border-gray-200 rounded-lg py-2 px-2 text-center text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category and Stock Info */}
          <div className="space-y-2">
            {product.category && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Category:</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
              </div>
            )}
            
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                In Stock
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all transform hover:scale-[1.02] ${
              compact ? 'py-2 text-sm' : 'py-3 text-base'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}