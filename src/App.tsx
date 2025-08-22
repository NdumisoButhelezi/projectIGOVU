import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Product, CartItem, Filters, Page } from './types';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminUpload from './components/AdminUpload';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Items from './pages/Items';
import Men from './pages/Men';
import Women from './pages/Women';
import ProductDetail from './components/ProductDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentFailed from './pages/PaymentFailed';
import OrderHistory from './pages/OrderHistory';
import DeliveryInfo from './pages/DeliveryInfo';
import { getFirestore, collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { app } from './config/firebase';
import { useAuth } from './contexts/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './pages/AdminProducts';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // const [activeTab] = useState<'all' | 'men' | 'women'>('all'); // Unused, but kept for reference
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    gender: [],
    category: '',
    color: [],
    priceRange: [0, 400],
    collection: [],
    size: '',
    sortBy: 'name'
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { uploadProduct, currentUser } = useAuth();

  // Fetch products from Firestore in real time
  useEffect(() => {
    setIsLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((doc, idx) => {
        const data = doc.data();
        // Ensure id is a number for compatibility with Product type
        return {
          ...data,
          id: data.id ? data.id : idx + 1, // fallback if no id field
        } as Product;
      });
      setProducts(productsData);
      setIsLoading(false);
      console.log(`Loaded ${productsData.length} products, loading state: ${isLoading ? 'loading' : 'complete'}`);
    }, (error) => {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const availableFilters = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        categories: [],
        colors: [],
        collections: [],
        maxPrice: 1000
      };
    }
    
    return {
      categories: [...new Set(products.filter(p => p && p.category).map(p => p.category))],
      colors: [...new Set(products.filter(p => p && p.color).map(p => p.color || ''))],
      collections: [...new Set(products.filter(p => p && p.collection).map(p => p.collection || '').filter(Boolean))],
      maxPrice: Math.max(...products.filter(p => p && typeof p.price === 'number').map(p => p.price), 1000)
    };
  }, [products]);

  // We're not using filteredProducts directly in App.tsx
  // Each component that needs filtered products does its own filtering
  // See Items.tsx for an example of how filters are applied

  const addToCart = async (product: Product) => {
    // Fetch latest stock from Firestore
    const db = getFirestore(app);
    const productRef = doc(db, 'products', String(product.id));
    const productSnap = await getDoc(productRef);
    const latestProduct = productSnap.exists() ? { id: productSnap.id, ...productSnap.data() } as Product : product;

    // Find current quantity in cart
    const cartItem = cartItems.find(item => String(item.id) === String(product.id));
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const availableStock = typeof latestProduct.stock === 'number' ? latestProduct.stock : Infinity;

    if (availableStock <= 0) {
      alert('Sorry, this product is out of stock.');
      return;
    }
    if (cartQuantity + 1 > availableStock) {
      alert('You have reached the maximum available stock for this product.');
      return;
    }

    setCartItems(items => {
      const existingItem = items.find(item => String(item.id) === String(product.id));
      if (existingItem) {
        return items.map(item =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...items,
        {
          ...product,
          quantity: 1,
          length_cm: product.length_cm ?? 20,
          width_cm: product.width_cm ?? 20,
          height_cm: product.height_cm ?? 10,
          weight_kg: product.weight_kg ?? 1
        }
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(items =>
      quantity === 0
        ? items.filter(item => String(item.id) !== String(id))
        : items.map(item =>
            String(item.id) === String(id) ? { ...item, quantity } : item
          )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => String(item.id) !== String(id)));
  };

  const handleProductSubmit = async (productData: Omit<Product, 'id'>) => {
    if (uploadProduct) {
      await uploadProduct(productData);
    }
    setIsAdminOpen(false);
    // No need to manually update products, real-time listener will update
  };

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    navigate(`/${page === 'home' ? '' : page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Navbar 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={handleAdminClick}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      <Routes>
        <Route path="/" element={<Home onShopClick={() => handleNavigation('items')} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery products={products} />} />
        <Route 
          path="/items" 
          element={
            <Items
              filters={filters}
              onFilterChange={setFilters}
              availableFilters={availableFilters}
              onAddToCart={addToCart}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <ProductDetail 
              product={products.find(p => String(p.id) === String(location.pathname.split('/').pop())) || products[0]} 
              onAddToCart={addToCart}
            />
          } 
        />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route 
          path="/men" 
          element={
            <Men 
              onAddToCart={addToCart}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          }
        />
        <Route 
          path="/women" 
          element={
            <Women 
              onAddToCart={addToCart}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/admin" element={currentUser ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/products" element={
          currentUser ? <AdminProducts /> : <Navigate to="/login" replace />
        } />
        <Route path="/delivery-info" element={<DeliveryInfo />} />
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