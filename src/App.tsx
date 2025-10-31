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
import ProductDetailPage from './pages/ProductDetailPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentFailed from './pages/PaymentFailed';
import OrderHistory from './pages/OrderHistory';
import DeliveryInfo from './pages/DeliveryInfo';
import { getFirestore, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
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
    priceRange: [0, 5000],
    collection: [],
    size: '',
    sortBy: 'name'
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { uploadProduct, currentUser } = useAuth();

  // Fetch products from Firestore in real time with proper image reconstruction
  useEffect(() => {
    setIsLoading(true);
    const db = getFirestore(app);
    // Use a simpler query without orderBy to avoid issues with missing fields
    const q = collection(db, 'products');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`App.tsx: Received ${snapshot.docs.length} products from Firestore`);
      console.log(`App.tsx: Raw snapshot data:`, snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const productsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Enhanced image reconstruction with better validation
        const images: string[] = [];
        let imageIndex = 0;
        
        // Reconstruct from chunked format (images.0, images.1, etc.)
        while (data[`images.${imageIndex}`]) {
          const imageUrl = data[`images.${imageIndex}`];
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
            images.push(imageUrl.trim());
          }
          imageIndex++;
        }
        
        // If no chunked images found, use the original images array
        if (images.length === 0 && data.images && Array.isArray(data.images)) {
          const validImages = data.images
            .filter(img => img && typeof img === 'string' && img.trim() !== '')
            .map(img => img.trim());
          images.push(...validImages);
        }
        
        // Remove duplicates and ensure all URLs are valid
        const cleanImages = [...new Set(images)].filter(img => {
          try {
            // Basic URL validation
            return img.startsWith('http') || img.startsWith('/') || img.startsWith('data:');
          } catch {
            return false;
          }
        });
        
        // Construct proper product object
        const product = {
          id: doc.id, // Use Firestore document ID as string
          name: data.name || '',
          price: Number(data.price) || 0,
          category: data.category || '',
          description: data.description || '',
          sizes: data.sizes || data.size || [],
          stock: Number(data.stock) || 0,
          images: cleanImages.length > 0 ? cleanImages : ['/1G5A2160.jpg'],
          color: data.color || '',
          collection: data.collection || '',
          features: data.features || [],
          care: data.care || [],
          gender: data.gender || '',
          material: data.material || '',
          fit: data.fit || '',
          occasion: data.occasion || '',
          season: data.season || '',
          brand: data.brand || '',
          sku: data.sku || '',
          length_cm: Number(data.length_cm) || undefined,
          width_cm: Number(data.width_cm) || undefined,
          height_cm: Number(data.height_cm) || undefined,
          weight_kg: Number(data.weight_kg) || undefined,
          measurement_unit: data.measurement_unit || 'cm',
          weight_unit: data.weight_unit || 'kg',
          createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
          lastUpdated: data.lastUpdated || data.timestamp || new Date().toISOString()
        } as Product;
        
        console.log(`App.tsx: Processed product ${product.name}`, {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images?.length || 0,
          category: product.category
        });
        
        return product;
      });
      
      // Filter out products without essential data (less strict filtering)
      const validProducts = productsData.filter(product => {
        const isValid = product.name && product.name.trim() !== '';
        if (!isValid) {
          console.log(`App.tsx: Filtering out invalid product:`, product);
        }
        return isValid;
      });
      
      // Sort products by name on client side
      const sortedProducts = validProducts.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      console.log(`App.tsx: Setting ${sortedProducts.length} valid products (filtered from ${productsData.length})`);
      console.log(`App.tsx: Products:`, sortedProducts.map(p => ({ id: p.id, name: p.name, price: p.price })));
      
      setProducts(sortedProducts);
      setIsLoading(false);
      console.log(`App.tsx: Loaded ${validProducts.length} products, loading state: complete`);
    }, (error) => {
      console.error("App.tsx: Error fetching products:", error);
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
        maxPrice: 5000
      };
    }
    
    return {
      categories: [...new Set(products.filter(p => p && p.category).map(p => p.category))],
      colors: [...new Set(products.filter(p => p && p.color).map(p => p.color || ''))],
      collections: [...new Set(products.filter(p => p && p.collection).map(p => p.collection || '').filter(Boolean))],
      maxPrice: Math.max(...products.filter(p => p && typeof p.price === 'number').map(p => p.price), 5000)
    };
  }, [products]);

  // We're not using filteredProducts directly in App.tsx
  // Each component that needs filtered products does its own filtering
  // See Items.tsx for an example of how filters are applied

  const addToCart = async (product: Product) => {
    console.log('App.tsx: Adding product to cart:', product.name, 'ID:', product.id);
    
    // Fetch latest stock from Firestore
    const db = getFirestore(app);
    const productRef = doc(db, 'products', String(product.id));
    
    try {
      const productSnap = await getDoc(productRef);
      const latestProduct = productSnap.exists() ? { 
        ...productSnap.data(), 
        id: productSnap.id 
      } as Product : product;

      // Find current quantity in cart
      const cartItem = cartItems.find(item => String(item.id) === String(product.id));
      const cartQuantity = cartItem ? cartItem.quantity : 0;
      const availableStock = typeof latestProduct.stock === 'number' ? latestProduct.stock : Infinity;

      console.log('App.tsx: Stock check - Available:', availableStock, 'In cart:', cartQuantity);

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
          console.log('App.tsx: Updating existing cart item quantity');
          return items.map(item =>
            String(item.id) === String(product.id)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        console.log('App.tsx: Adding new item to cart');
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
    } catch (error) {
      console.error('App.tsx: Error checking stock:', error);
      // Continue with adding to cart using current product data
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
    }
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
              products={products}
            />
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <ProductDetailPage 
              products={products}
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