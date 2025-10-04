import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductDetail from '../components/ProductDetail';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProductDetailPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailPage({ products, onAddToCart }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      console.log('ProductDetailPage: Looking for product with ID:', id);
      
      // First try to find in the products array (from App.tsx real-time listener)
      const foundProduct = products.find(p => String(p.id) === String(id));
      
      if (foundProduct) {
        console.log('ProductDetailPage: Found product in products array:', foundProduct.name);
        setProduct(foundProduct);
        setLoading(false);
        return;
      }

      // If not found in array, fetch directly from Firestore
      try {
        console.log('ProductDetailPage: Fetching product directly from Firestore...');
        const db = getFirestore(app);
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          
          // Reconstruct images array from individual image fields (chunked format)
          const images: string[] = [];
          let imageIndex = 0;
          while (data[`images.${imageIndex}`]) {
            images.push(data[`images.${imageIndex}`]);
            imageIndex++;
          }
          
          // If no chunked images found, use the original images array
          if (images.length === 0 && data.images && Array.isArray(data.images)) {
            images.push(...data.images);
          }
          
          const productData = {
            id: productSnap.id,
            name: data.name || '',
            price: Number(data.price) || 0,
            category: data.category || '',
            description: data.description || '',
            sizes: data.sizes || data.size || [],
            stock: Number(data.stock) || 0,
            images: images.length > 0 ? images : (data.images || []),
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

          console.log('ProductDetailPage: Fetched product from Firestore:', productData.name);
          setProduct(productData);
        } else {
          console.log('ProductDetailPage: Product not found in Firestore');
          setError('Product not found');
        }
      } catch (error) {
        console.error('ProductDetailPage: Error fetching product:', error);
        setError('Failed to load product');
      }

      setLoading(false);
    }

    fetchProduct();
  }, [id, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" color="#10B981" />
          <p className="mt-4 text-xl font-semibold text-green-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/items')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} onAddToCart={onAddToCart} />;
}
