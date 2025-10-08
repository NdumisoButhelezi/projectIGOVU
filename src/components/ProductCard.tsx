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
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser) {
      onAddToCart(product);
    } else {
      onOpenAuth();
    }
  };

  // Enhanced image handling with carousel functionality
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ['/1G5A2160.jpg'];
  
  const currentImage = images[currentImageIndex] || '/1G5A2160.jpg';
  const hasMultipleImages = images.length > 1;

  const handleImageError = () => {
    setImageError(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Safe size handling - check both 'sizes' and 'size' fields
  const sizes: string[] = Array.isArray((product as any).sizes)
    ? (product as any).sizes
    : Array.isArray((product as any).size)
      ? (product as any).size
      : [];

  return (
    <div 
      className={`group relative rounded-xl transition-all duration-300 overflow-hidden ${
        compact ? 'p-4 flex flex-row items-start gap-4 min-h-[140px]' : 'p-4'
      }`}
    >
      <Link 
        to={`/product/${product.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${product.name}`}
      />
      <div className={compact ? 'flex gap-4 w-full' : 'space-y-4'}>
        {/* Enhanced Image with Carousel Navigation */}
        <div className={compact ? 'w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner relative' : 'aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 relative shadow-inner group/image'}>
          <img
            src={imageError ? '/1G5A2160.jpg' : currentImage}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
          />
          
          {/* Image Navigation for Multiple Images */}
          {!compact && hasMultipleImages && (
            <>
              {/* Previous Image Button */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 z-10"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Next Image Button */}
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 z-10"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Image Indicator Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/image:opacity-100 transition-all duration-300">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Enhanced image count indicator */}
          {!compact && hasMultipleImages && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>

        {/* Enhanced Product Info */}
        <div className={compact ? 'flex-1 min-w-0 space-y-4' : 'space-y-5'}>
          {/* Title and Description with Better Typography */}
          <div>
            <h3 className={`font-bold text-gray-900 leading-tight group-hover:text-black transition-colors ${compact ? 'text-xl mb-2' : 'text-2xl mb-3'}`}>
              {product.name}
            </h3>
            <p className={`text-gray-600 leading-relaxed ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'}`}>
              {product.description}
            </p>
          </div>

          {/* Enhanced Price Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className={`font-bold text-black ${compact ? 'text-2xl' : 'text-3xl'}`}>
                R {product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 font-medium">incl. VAT</span>
            </div>
            {/* Price per item indicator for bulk orders */}
            <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              Per item
            </div>
          </div>

          {/* Enhanced Available Sizes */}
          {sizes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Available Sizes
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {sizes.slice(0, 4).map(size => (
                  <div 
                    key={size}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-center text-sm font-semibold hover:from-gray-100 hover:to-gray-150 hover:border-gray-300 transition-all transform hover:scale-105 shadow-sm"
                  >
                    {size}
                  </div>
                ))}
                {sizes.length > 4 && (
                  <div className="bg-gray-200 border border-gray-300 rounded-lg py-2 px-3 text-center text-xs font-medium text-gray-600">
                    +{sizes.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Category and Stock Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {product.category && (
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {product.category}
                  </span>
                </div>
              )}
              
              {/* Enhanced Stock Status */}
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  In Stock
                </span>
              </div>
            </div>
            
            {/* Additional product highlights */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Premium Quality
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Fast Delivery
              </span>
            </div>
          </div>

          {/* Enhanced Action Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
              compact ? 'py-3 text-sm' : 'py-4 text-base'
            } relative overflow-hidden group-hover:shadow-2xl z-20`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Add to Cart
              <span className="text-lg">+</span>
            </span>
            {/* Subtle animated background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
          </button>
        </div>
      </div>
    </div>
  );
}