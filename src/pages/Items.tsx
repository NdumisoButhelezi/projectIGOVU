import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import FiltersComponent from '../components/Filters';
import { ShoppingBag, CreditCard, Truck, Package, Filter } from 'lucide-react';
// Firebase imports removed - now using products from App.tsx

import { Filters } from '../types';

interface ItemsProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  availableFilters: {
    categories?: string[];
    sizes?: string[];
    colors?: string[];
    collections?: string[];
    maxPrice?: number;
  };
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
  products: Product[]; // Add products prop to receive from App.tsx
}

import LoadingSpinner from '../components/LoadingSpinner';

export default function Items({
  filters = {}, // Ensure filters is always an object
  onFilterChange,
  availableFilters, // Accept availableFilters prop
  onAddToCart,
  onOpenAuth,
  products: productsFromApp // Accept products from App.tsx
}: ItemsProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Start with false since we get products from App.tsx
  const [extractedFilters, setExtractedFilters] = useState({
    categories: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    collections: [] as string[],
    maxPrice: 1000
  });
  
  // Use products from App.tsx
  const products = productsFromApp;
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024;

  // Initialize with products from App.tsx and extract filters
  useEffect(() => {
    console.log("Items component: Received products from App.tsx:", products.length);
    
    if (products.length === 0) {
      setFilteredProducts([]);
      setExtractedFilters({
        categories: [],
        sizes: [],
        colors: [],
        collections: [],
        maxPrice: 1000
      });
      return;
    }
    
    setFilteredProducts(products);

    // Extract available filters from products
    const categories = new Set<string>();
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const collections = new Set<string>();
    let maxPrice = 1000;

    products.forEach((product: Product) => {
      if (product.category) {
        categories.add(product.category);
      }
      
      // Check both 'sizes' and 'size' fields from AdminUpload
      const productSizes = (product as any).sizes || (product as any).size || [];
      if (Array.isArray(productSizes)) {
        productSizes.forEach(size => {
          if (size && typeof size === 'string') {
            sizes.add(size);
          }
        });
      }
      
      // Add color to filters
      if (product.color) {
        colors.add(product.color);
      }
      
      // Add collection to filters
      if (product.collection) {
        collections.add(product.collection);
      }
      
      // Track maximum price
      if (typeof product.price === 'number' && product.price > maxPrice) {
        maxPrice = product.price;
      }
    });

    setExtractedFilters({
      categories: Array.from(categories).sort(),
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      collections: Array.from(collections).sort(),
      maxPrice: maxPrice
    });
    
    console.log("Items component: Processed products and filters");
  }, [products]);

  // No longer need separate product fetching - using products from App.tsx

  // Apply filters when filters change
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
    // Add a small delay to show smooth transition
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      let filtered = [...products];

    // Category filter - handle both string and string[] cases
    if (filters?.category) {
      if (typeof filters.category === 'string' && filters.category.trim() !== '') {
        // If category is a string
        const categoryStr = filters.category;
        filtered = filtered.filter(product => {
          if (!product || !product.category) return false;
          const productCategory = product.category;
          return typeof productCategory === 'string' &&
                 productCategory.toLowerCase().includes(categoryStr.toLowerCase());
        });
      } else if (Array.isArray(filters.category) && filters.category.length > 0) {
        // If category is an array of strings
        const categoryArray = filters.category;
        filtered = filtered.filter(product => {
          if (!product || !product.category) return false;
          return categoryArray.some((cat: string) => 
            product.category.toLowerCase().includes(cat.toLowerCase())
          );
        });
      }
    }

    // Price range filter - ensure we have a valid array
    if (filters?.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length === 2) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (typeof minPrice === 'number' && typeof maxPrice === 'number' && minPrice >= 0 && maxPrice > 0) {
        filtered = filtered.filter(product => 
          product && typeof product.price === 'number' && 
          product.price >= minPrice && 
          product.price <= maxPrice
        );
      }
    }

    // Size filter - ensure we have a valid string
    if (filters?.size && typeof filters.size === 'string' && filters.size.trim() !== '') {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        // Try to get sizes from different possible properties
        const productSizes = product.sizes || product.size || [];
        
        // Handle both array and string cases
        if (Array.isArray(productSizes)) {
          return productSizes.includes(filters.size || '');
        } else if (typeof productSizes === 'string') {
          return productSizes === filters.size;
        }
        
        return false;
      });
    }

    // Sort - ensure we have a valid sort option
    const sortBy = filters?.sortBy && typeof filters.sortBy === 'string' ? filters.sortBy : 'name';
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => ((a && a.price) || 0) - ((b && b.price) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => ((b && b.price) || 0) - ((a && a.price) || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date((a && a.createdAt) || 0).getTime();
          const dateB = new Date((b && b.createdAt) || 0).getTime();
          return dateB - dateA;
        });
        break;
      default:
        filtered.sort((a, b) => ((a && a.name) || '').localeCompare((b && b.name) || ''));
    }

      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 150); // Small delay for smooth transitions

    return () => clearTimeout(timeoutId);
  }, [products, filters]);

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

  const handleApplyFilters = () => {
    setFiltersOpen(false);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Cover Image with Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/1G5A2160.jpg')"
          }}
        ></div>
        
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-black mb-6 drop-shadow-2xl gradient-text bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text">
              IGOVU Collection
            </h1>
            <p className="text-xl lg:text-2xl text-gray-100 drop-shadow-lg mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover our premium quality clothing line crafted with passion and precision ✨
            </p>
            
            {/* Enhanced Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm lg:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced How to Order Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">How to Order</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple steps to get your premium IGOVU products delivered to your door</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
            <div className="group bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border border-gray-100" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="mb-2 w-8 h-1 bg-gray-200 mx-auto rounded-full"></div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">1. Choose Items</h3>
              <p className="text-gray-600 leading-relaxed">Browse our premium collection and select your favorite pieces with confidence</p>
            </div>
            
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border-2 border-green-200" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div className="mb-2 w-8 h-1 bg-green-300 mx-auto rounded-full"></div>
              <h3 className="text-xl font-bold mb-3 text-green-800">2. Secure Payment</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">Complete payment to confirm your order and secure your items</p>
              <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full inline-block border border-green-200">
                ✓ 100% Secure Checkout
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border border-gray-100" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="mb-2 w-8 h-1 bg-gray-200 mx-auto rounded-full"></div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">3. Quick Processing</h3>
              <p className="text-gray-600 leading-relaxed">Your order enters our production queue for fast and efficient processing</p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border border-gray-100" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="mb-2 w-8 h-1 bg-gray-200 mx-auto rounded-full"></div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">4. Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Enjoy free delivery for orders with 2+ items, straight to your door</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="large" color="#10B981" />
              <p className="mt-4 text-xl font-semibold text-green-600">Loading products...</p>
              <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the latest products</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Filters Sidebar - Enhanced for Desktop */}
              <div className="lg:col-span-3">
                {isMobile ? (
                  <div className="mb-6">
                    <button
                      className="w-full px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
                      onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Filter className="w-5 h-5" />
                        {filtersOpen ? 'Hide Filters' : 'Show Filters & Sort'}
                      </div>
                    </button>
                    {filtersOpen && (
                      <div className="mt-4">
                        <FiltersComponent
                          filters={filters || {}} // Ensure filters is never undefined
                          onFilterChange={onFilterChange}
                          availableFilters={availableFilters || extractedFilters}
                          onApplyFilters={handleApplyFilters}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="sticky top-20">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters & Sort
                      </h3>
                      <FiltersComponent
                        filters={filters || {}} // Ensure filters is never undefined
                        onFilterChange={onFilterChange}
                        availableFilters={availableFilters || extractedFilters}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Products Grid - Enhanced for Desktop */}
              <div className={isMobile ? "col-span-1" : "lg:col-span-4"}>
                {/* Enhanced Header with Better Typography */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Our Collection
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {filteredProducts.length} premium {filteredProducts.length === 1 ? 'item' : 'items'} available
                      </p>
                      {products.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          From {products.length} total products in our catalog
                        </p>
                      )}
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="hidden lg:flex flex-col items-end space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-600">All items in stock</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Free delivery for 2+ items</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Debug info - minimized for better UX */}
                  <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                    <p>Last sync: {new Date().toLocaleTimeString()} • {filteredProducts.length} filtered from {products.length} total</p>
                  </div>
                </div>

                {/* Products List with Enhanced Spacing */}
                <div className="relative">
                  {/* Subtle loading overlay during filtering */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <div className="space-y-6 custom-scrollbar">
                    {filteredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      onClick={() => handleProductClick(product)}
                      className="cursor-pointer animate-fade-in"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: 'both'
                      }}
                    >
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
                {/* Enhanced Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                      <ShoppingBag className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                      We couldn't find any products matching your criteria. Try adjusting your filters or browse our full collection.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => onFilterChange({})}
                        className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
                      >
                        Clear All Filters
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Refresh Products
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Product Detail Panel */}
              {!isMobile && (
                <div className="lg:col-span-5">
                  {selectedProduct ? (
                    <div className="sticky top-20">
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <ProductDetail
                          product={selectedProduct}
                          onAddToCart={onAddToCart}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="sticky top-20">
                      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          Select a Product
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Choose any product from the list to view detailed information, images, and sizing options.
                        </p>
                        {filteredProducts.length > 0 && (
                          <button
                            onClick={() => setSelectedProduct(filteredProducts[0])}
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
                          >
                            View First Product
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}