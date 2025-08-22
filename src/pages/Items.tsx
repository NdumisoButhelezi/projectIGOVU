import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import FiltersComponent from '../components/Filters';
import { ShoppingBag, CreditCard, Truck, Package, Filter } from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../config/firebase';

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
}

import LoadingSpinner from '../components/LoadingSpinner';

export default function Items({
  filters = {}, // Ensure filters is always an object
  onFilterChange,
  availableFilters, // Accept availableFilters prop
  onAddToCart,
  onOpenAuth
}: Omit<ItemsProps, 'products' | 'filteredProducts'> & { filteredProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedFilters, setExtractedFilters] = useState({
    categories: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    collections: [] as string[],
    maxPrice: 1000
  });
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024;

  // Fetch products from Firestore
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const db = getFirestore(app);
        const snap = await getDocs(collection(db, 'products'));
        const prods = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) })) as Product[];
        setProducts(prods);
        setFilteredProducts(prods);

        // Extract available filters from products
        const categories = new Set<string>();
        const sizes = new Set<string>();
        const colors = new Set<string>();
        const collections = new Set<string>();
        let maxPrice = 1000;

        prods.forEach(product => {
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
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
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
      {/* Hero Section with Cover Image */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Cover Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/1G5A2160.jpg')"
          }}
        ></div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">IGOVU Collection 🛍️</h1>
            <p className="text-xl text-gray-100 drop-shadow-md">Discover our premium quality clothing line ✨</p>
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
            
            <div className="bg-gray-50 p-6 rounded-xl text-center border-2 border-green-200">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2 text-green-700">2. Confirm Order</h3>
              <p className="text-gray-600">Pay 100% upfront to secure your order 💳</p>
              <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full inline-block">
                Full Payment Required
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-black" />
              <h3 className="text-lg font-semibold mb-2">3. Processing</h3>
              <p className="text-gray-600">Order enters production queue immediately ⚡</p>
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="large" color="#10B981" />
              <p className="mt-4 text-xl font-semibold text-green-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Filters Sidebar */}
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
                    <FiltersComponent
                      filters={filters || {}} // Ensure filters is never undefined
                      onFilterChange={onFilterChange}
                      availableFilters={availableFilters || extractedFilters}
                    />
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className={isMobile ? "col-span-1" : "lg:col-span-4"}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Products ({filteredProducts.length})
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Discover our premium IGOVU collection
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => handleProductClick(product)}
                      className="cursor-pointer"
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
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or browse all products.
                    </p>
                    <button
                      onClick={() => onFilterChange({})}
                      className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Product Detail */}
              {!isMobile && (
                <div className="lg:col-span-5">
                  {selectedProduct ? (
                    <div className="sticky top-20">
                      <ProductDetail
                        product={selectedProduct}
                        onAddToCart={onAddToCart}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-24">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Select a product to view details</p>
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