import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, ShoppingCart, MessageCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
}

export default function ProductCard({ product, onAddToCart, onOpenAuth }: ProductCardProps) {
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
      to={`/product/${product.id}`}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="aspect-w-4 aspect-h-5 w-full overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none bg-gray-100 relative">
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Price Tag */}
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-1.5 rounded-full font-bold shadow-lg">
            R {product.price.toFixed(2)}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            <p className="mt-2 text-gray-600 line-clamp-3">{product.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.size.map(size => (
              <span 
                key={size}
                className="px-3 py-1 border rounded-full text-sm font-medium"
              >
                {size}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all"
            >
              {currentUser ? (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in to Buy
                </>
              )}
            </button>
            
            {product.whatsapp && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const message = encodeURIComponent(
                    `Hi, I'm interested in the ${product.name}. Can you provide more information?`
                  );
                  window.open(`https://wa.me/${product.whatsapp}?text=${message}`, '_blank');
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Inquire
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}