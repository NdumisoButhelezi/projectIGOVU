import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, TrendingUp, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../config/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

interface MenProps {
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
}

export default function Men({ onAddToCart, onOpenAuth }: MenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const navigate = useNavigate();

  // Fetch men's products
  useEffect(() => {
    async function fetchMenProducts() {
      setIsLoading(true);
      try {
        const db = getFirestore(app);
        // Fetch all products first, then filter by gender if the field exists
        const snap = await getDocs(collection(db, 'products'));
        const allProducts = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...(doc.data() as Omit<Product, 'id'>) 
        })) as Product[];
        
        // Filter for men's products - check multiple possible fields
        const menProducts = allProducts.filter(product => {
          const gender = (product as any).gender || (product as any).targetGender || '';
          return gender.toLowerCase().includes('men') || 
                 gender.toLowerCase().includes('male') ||
                 product.category?.toLowerCase().includes('men');
        });
        
        setProducts(menProducts);
        setFilteredProducts(menProducts);
      } catch (error) {
        console.error("Error fetching men's products:", error);
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
    fetchMenProducts();
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
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/1G5A2104.jpg')"
          }}
        ></div>
        
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Men's Collection
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-md mb-8">
              Bold designs for the modern man. Be confident, be IGOVU.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Shop Men's
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
            {[
              { name: 'Hoodies', image: '/1G5A2039.jpg' },
              { name: 'T-Shirts', image: '/1G5A2081.jpg' },
              { name: 'Pants', image: '/1G5A2104.jpg' }
            ].map((category) => (
              <div 
                key={category.name}
                className="group relative bg-gray-100 rounded-2xl overflow-hidden h-64 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => setCategoryFilter(category.name)}
              >
                {/* Category Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url('${category.image}')`
                  }}
                ></div>
                
                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300 z-10"></div>
                
                {/* Category Content */}
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{category.name}</h3>
                  <p className="text-gray-200 drop-shadow-md">Explore Collection</p>
                </div>
                
                {/* Hover Icon */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Subtle border animation */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-300 z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products-section" className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Men's Products ({filteredProducts.length})
              </h2>
              {categoryFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Filtered by:</span>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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

          {/* Enhanced Products Grid/List with Better Separation */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="large" color="#000000" />
              <p className="mt-4 text-xl font-semibold text-gray-600">Loading men's collection...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
                : "space-y-6"
            }>
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`cursor-pointer animate-fade-in ${
                    viewMode === 'grid' 
                      ? 'transform hover:-translate-y-2 transition-all duration-300' 
                      : ''
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-2 border border-gray-100 hover:border-gray-200">
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onOpenAuth={onOpenAuth}
                      compact={viewMode === 'list'}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {categoryFilter 
                  ? `No men's ${categoryFilter.toLowerCase()} available right now.`
                  : "No men's products available right now."
                }
              </p>
              {categoryFilter && (
                <button 
                  onClick={() => setCategoryFilter('')}
                  className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  View All Men's Products
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Find Your Perfect Style
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover bold designs that reflect your confidence and courage
          </p>
          <button 
            onClick={() => navigate('/items')}
            className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Explore All Collections
          </button>
        </div>
      </div>
    </div>
  );
}
