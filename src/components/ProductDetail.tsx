import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Truck, Shield, Package, Calendar } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [selectedTab, setSelectedTab] = useState<'info' | 'shipping' | 'returns' | 'payment'>('info');
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Items
          </button>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img 
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden bg-gray-100 ${
                    selectedImage === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <img 
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-bold">R {product.price.toFixed(2)}</p>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex space-x-8">
                {[
                  { id: 'info', label: 'Product Info' },
                  { id: 'shipping', label: 'Shipping' },
                  { id: 'returns', label: 'Returns' },
                  { id: 'payment', label: 'Payment Options' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-4 relative ${
                      selectedTab === tab.id
                        ? 'text-black'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {tab.label}
                    {selectedTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {selectedTab === 'info' && (
                <div className="space-y-6">
                  <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                  
                  {product.features && (
                    <div>
                      <h3 className="font-semibold mb-3">Features</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="text-gray-600">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.care && (
                    <div>
                      <h3 className="font-semibold mb-3">Care Instructions</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {product.care.map((instruction, index) => (
                          <li key={index} className="text-gray-600">{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3">Available Sizes</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {product.size.map((size) => (
                        <button
                          key={size}
                          className="py-3 border-2 rounded-lg hover:border-black transition-colors"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'shipping' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Truck className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold mb-1">Free Delivery</h3>
                      <p className="text-gray-600">For orders of 2+ items</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Package className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold mb-1">PAXi Delivery</h3>
                      <p className="text-gray-600">R60 for single items to your nearest Pep Store</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'returns' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold mb-1">30-Day Returns</h3>
                      <p className="text-gray-600">
                        Return within 30 days of delivery. Item must be unused and in original packaging.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'payment' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Shield className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold mb-1">Secure Payment Options</h3>
                      <p className="text-gray-600">
                        • Yoco Payment Link<br />
                        • eWallet Transfer<br />
                        • In-person payment (Durban & Joburg areas)
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Payment Plans</h3>
                    <p className="text-gray-600">
                      • 60% upfront to confirm order<br />
                      • 100% upfront option available
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="pt-6 mt-6 border-t">
              <button
                onClick={() => onAddToCart(product)}
                className="w-full btn-primary flex items-center justify-center gap-2 text-lg"
              >
                Add to Cart • R {product.price.toFixed(2)}
              </button>
              {product.whatsapp && (
                <button
                  onClick={() => {
                    const message = encodeURIComponent(
                      `Hi, I'm interested in the ${product.name}. Can you provide more information?`
                    );
                    window.open(`https://wa.me/${product.whatsapp}?text=${message}`, '_blank');
                  }}
                  className="w-full mt-4 py-3 px-6 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  Inquire on WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}