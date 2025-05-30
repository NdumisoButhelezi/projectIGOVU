import React, { useState, useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Product, CartItem, Filters, Page } from './types';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FiltersComponent from './components/Filters';
import AdminUpload from './components/AdminUpload';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Items from './pages/Items';
import ProductDetail from './components/ProductDetail';
import { products as initialProducts } from './data/products';

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'men' | 'women'>('all');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [filters, setFilters] = useState<Filters>({
    gender: [],
    category: [],
    color: [],
    priceRange: [0, 400],
    collection: []
  });

  const location = useLocation();
  const navigate = useNavigate();

  const availableFilters = useMemo(() => {
    return {
      categories: [...new Set(products.map(p => p.category))],
      colors: [...new Set(products.map(p => p.color))],
      collections: [...new Set(products.map(p => p.collection).filter(Boolean))],
      maxPrice: Math.max(...products.map(p => p.price))
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (activeTab !== 'all' && product.gender !== activeTab) return false;
      if (filters.gender.length && !filters.gender.includes(product.gender)) return false;
      if (filters.category.length && !filters.category.includes(product.category)) return false;
      if (filters.color.length && !filters.color.includes(product.color)) return false;
      if (filters.collection.length && !filters.collection.includes(product.collection || '')) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      return true;
    });
  }, [activeTab, filters, products]);

  const addToCart = (product: Product) => {
    setCartItems(items => {
      const existingItem = items.find(item => item.id === product.id);
      if (existingItem) {
        return items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(items =>
      quantity === 0
        ? items.filter(item => item.id !== id)
        : items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckoutComplete = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  const handleProductSubmit = (productData: Omit<Product, 'id'>) => {
    const newProduct = {
      ...productData,
      id: products.length + 1
    };
    setProducts(prev => [...prev, newProduct]);
    setIsAdminOpen(false);
  };

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    navigate(`/${page === 'home' ? '' : page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Navbar 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      <Routes>
        <Route path="/" element={<Home onShopClick={() => handleNavigation('items')} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route 
          path="/items" 
          element={
            <Items
              products={products}
              filters={filters}
              onFilterChange={setFilters}
              availableFilters={availableFilters}
              filteredProducts={filteredProducts}
              onAddToCart={addToCart}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <ProductDetail 
              product={products[0]} 
              onAddToCart={addToCart}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          } 
        />
        <Route 
          path="/men" 
          element={
            <div className="pt-16">
              <div className="py-16 sm:py-24 bg-white">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid gap-6 sm:gap-8">
                    {products
                      .filter(p => p.gender === 'men' || p.gender === 'unisex')
                      .map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={addToCart}
                          onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <Route 
          path="/women" 
          element={
            <div className="pt-16">
              <div className="py-16 sm:py-24 bg-white">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid gap-6 sm:gap-8">
                    {products
                      .filter(p => p.gender === 'women' || p.gender === 'unisex')
                      .map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={addToCart}
                          onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </Routes>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onCheckoutComplete={handleCheckoutComplete}
      />

      <AdminUpload
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSubmit={handleProductSubmit}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;