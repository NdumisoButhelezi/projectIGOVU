import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, TrendingUp, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../config/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

interface WomenProps {
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
}

export default function Women({ onAddToCart, onOpenAuth }: WomenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const navigate = useNavigate();

  // Fetch women's products
  useEffect(() => {
    async function fetchWomenProducts() {
      setIsLoading(true);
      try {
        const db = getFirestore(app);
        // Fetch all products first, then filter by gender if the field exists
        const snap = await getDocs(collection(db, 'products'));
        const allProducts = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...(doc.data() as Omit<Product, 'id'>) 
        })) as Product[];
        
        // Filter for women's products - check multiple possible fields
        const womenProducts = allProducts.filter(product => {
          const gender = (product as any).gender || (product as any).targetGender || '';
          return gender.toLowerCase().includes('women') || 
                 gender.toLowerCase().includes('female') ||
                 product.category?.toLowerCase().includes('women');
        });
        
        setProducts(womenProducts);
        setFilteredProducts(womenProducts);
      } catch (error) {
        console.error("Error fetching women's products:", error);
        // If there's an error, fetch all products as fallback
        try {
          const db = getFirestore(app);
          const snap = await getDocs(collection(db, 'products'));
          const allProducts = snap.docs.map(doc => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<Product, 'id'>) 
          })) as Product[];
          setProducts(allProducts);
          setFilteredProducts(allProducts);
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchWomenProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, categoryFilter]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-900 to-pink-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/1G5A2179.jpg')"
          }}
        ></div>
        
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Women's Collection
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-md mb-8">
              Elegant styles for the empowered woman. Be bold, be beautiful, be IGOVU.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Shop Women's
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Dresses', 'T-Shirts', 'Accessories'].map((category, index) => (
              <div 
                key={category}
                className="group relative bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden h-64 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => setCategoryFilter(category)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-2">{category}</h3>
                  <p className="text-gray-200">Explore Collection</p>
                </div>
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Women's Products ({filteredProducts.length})
              </h2>
              {categoryFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Filtered by:</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {categoryFilter}
                  </span>
                  <button 
                    onClick={() => setCategoryFilter('')}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="large" color="#9333ea" />
              <p className="mt-4 text-xl font-semibold text-gray-600">Loading women's collection...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onOpenAuth={onOpenAuth}
                    compact={viewMode === 'list'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {categoryFilter 
                  ? `No women's ${categoryFilter.toLowerCase()} available right now.`
                  : "No women's products available right now."
                }
              </p>
              {categoryFilter && (
                <button 
                  onClick={() => setCategoryFilter('')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  View All Women's Products
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-purple-900 to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Express Your Unique Style
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Discover elegant designs that celebrate your individuality and strength
          </p>
          <button 
            onClick={() => navigate('/items')}
            className="bg-white text-purple-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Explore All Collections
          </button>
        </div>
      </div>
    </div>
  );
}
