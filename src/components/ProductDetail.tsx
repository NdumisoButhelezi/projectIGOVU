import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Heart, Share2, Truck, Shield, Package, Calendar, ChevronDown, Info, RotateCcw, CreditCard } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [selectedTab, setSelectedTab] = useState<'info' | 'shipping' | 'returns' | 'payment'>('info');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const productUrl = `${window.location.origin}/product/${product.id}`;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Close share dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShare(false);
      }
    }
    if (showShare) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShare]);

  const allTabs = [
    { id: 'info', label: 'Product Info', icon: <Info className="w-4 h-4 mr-1" /> },
    { id: 'shipping', label: 'Shipping', icon: <Truck className="w-4 h-4 mr-1" /> },
    { id: 'returns', label: 'Returns', icon: <RotateCcw className="w-4 h-4 mr-1" /> },
    { id: 'payment', label: 'Payment Options', icon: <CreditCard className="w-4 h-4 mr-1" /> }
  ];

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
          <div className="flex gap-4 items-center">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="h-5 w-5" />
            </button>
            <div className="relative" ref={shareRef}>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowShare(s => !s)}
                aria-haspopup="true"
                aria-expanded={showShare}
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              {showShare && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-30 animate-fade-in">
                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-blue-600"
                    onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank'); setShowShare(false); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                    Facebook
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-blue-400"
                    onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=Check%20out%20this%20product!`, '_blank'); setShowShare(false); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
                    Twitter/X
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-green-600"
                    onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent('Check out this product: ' + productUrl)}`, '_blank'); setShowShare(false); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.69.97.99-3.59-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>
                    WhatsApp
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-gray-700"
                    onClick={() => { navigator.clipboard.writeText(productUrl); setShowShare(false); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3"/></svg>
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img 
                src={product.images[0]}
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
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col h-full">
              <div>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-2xl font-bold">R {product.price.toFixed(2)}</p>
              </div>
              {/* Dropdown for all tabs */}
              <div className="mt-6 mb-2 w-full max-w-xs" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(d => !d)}
                  className="w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                  aria-haspopup="listbox"
                  aria-expanded={showDropdown}
                >
                  <span className="flex items-center">
                    {allTabs.find(tab => tab.id === selectedTab)?.icon}
                    {allTabs.find(tab => tab.id === selectedTab)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {showDropdown && (
                  <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow-lg animate-fade-in">
                    {allTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => { setSelectedTab(tab.id as any); setShowDropdown(false); }}
                        className={`w-full flex items-center px-4 py-2 text-left transition-colors ${selectedTab === tab.id ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
                      >
                        {tab.icon}{tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tab Content */}
              <div className="space-y-6 mt-6 flex-1">
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

              {/* Add to Cart and WhatsApp button remain inside card */}
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
    </div>
  );
}