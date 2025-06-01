import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024;

  // Preselect the first product for desktop
  useEffect(() => {
    if (!isMobile && filteredProducts.length > 0) {
      setSelectedProduct(filteredProducts[0]);
    }
  }, [isMobile, filteredProducts]);

  const handleProductClick = (product: Product) => {
    if (isMobile) {
      navigate(`/product/${product.id}`);
    } else {
      setSelectedProduct(product);
    }
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Filters Sidebar (desktop) */}
            <div className="lg:col-span-2">
              {/* Mobile: show filters and items side by side or stacked with spacing */}
              {isMobile ? (
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex-shrink-0 w-full sm:w-1/2">
                    <FiltersComponent
                      filters={filters}
                      onFilterChange={onFilterChange}
                      availableFilters={availableFilters}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 gap-4">
                      {filteredProducts.map(product => (
                        <div key={product.id} onClick={() => handleProductClick(product)}>
                          <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                            onOpenAuth={onOpenAuth}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <button
                    className="mb-4 px-4 py-2 bg-black text-white rounded-lg w-full hover:bg-gray-800 transition"
                    onClick={() => setFiltersOpen(open => !open)}
                  >
                    {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <div className={`transition-all duration-300 ${filtersOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <FiltersComponent
                      filters={filters}
                      onFilterChange={onFilterChange}
                      availableFilters={availableFilters}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Items grid */}
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-4">
                {filteredProducts.map(product => (
                  <div key={product.id} onClick={() => handleProductClick(product)}>
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onOpenAuth={onOpenAuth}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Product Detail */}
            <div className="lg:col-span-6">
              {!isMobile && selectedProduct ? (
                <ProductDetail
                  product={selectedProduct}
                  onAddToCart={onAddToCart}
                />
              ) : (
                <div className="text-center text-gray-400 py-24">
                  <span>Select a product to view details</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}