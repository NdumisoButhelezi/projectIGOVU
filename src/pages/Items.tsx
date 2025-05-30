import React from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import FiltersComponent from '../components/Filters';
import { ShoppingBag, CreditCard, Truck, Package } from 'lucide-react';

interface ItemsProps {
  products: Product[];
  filters: any;
  onFilterChange: (filters: any) => void;
  availableFilters: any;
  filteredProducts: Product[];
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
}

export default function Items({
  products,
  filters,
  onFilterChange,
  availableFilters,
  filteredProducts,
  onAddToCart,
  onOpenAuth
}: ItemsProps) {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">IGOVU Collection 🛍️</h1>
            <p className="text-xl text-gray-300">Discover our premium quality clothing line ✨</p>
          </div>
        </div>
      </div>

      {/* How to Order Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How to Order 📦</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold mb-2">1. Choose Items</h3>
              <p className="text-gray-600">Browse and select your favorite pieces 👕</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold mb-2">2. Confirm Order</h3>
              <p className="text-gray-600">Pay 60% or 100% upfront 💳</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold mb-2">3. Processing</h3>
              <p className="text-gray-600">Order enters production queue ⚡</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold mb-2">4. Delivery</h3>
              <p className="text-gray-600">Free delivery for 2+ items 🚚</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <FiltersComponent
                  filters={filters}
                  onFilterChange={onFilterChange}
                  availableFilters={availableFilters}
                />
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="grid gap-6 sm:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onOpenAuth={onOpenAuth}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}