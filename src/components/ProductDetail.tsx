import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Heart, Share2, Truck, Shield, Package, Calendar, ChevronDown, Info, RotateCcw, CreditCard, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetail({ product, onAddToCart }: { product: Product | undefined, onAddToCart?: (product: Product) => void }) {
  const [selectedTab, setSelectedTab] = useState<'info' | 'shipping' | 'returns' | 'payment'>('info');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const productUrl = `${window.location.origin}/product/${product?.id}`;
  useAuth();

  // Enhanced image handling with better cleaning and validation
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  
  const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images
        .map(img => typeof img === 'string' ? img.trim() : '') // Clean strings
        .filter(img => img !== '' && img !== null && img !== undefined) // Filter out invalid
        .filter((img, index, arr) => arr.indexOf(img) === index) // Remove duplicates
    : ['/1G5A2160.jpg']; // Fallback to default image

  const hasMultipleImages = productImages.length > 1;
  const currentImageUrl = productImages[selectedImage] || productImages[0] || '/1G5A2160.jpg';

  // Handle individual image errors
  const handleImageError = (index: number) => {
    console.log(`ProductDetail: Image ${index} failed to load: ${productImages[index]}`);
    setImageErrors(prev => new Set(prev).add(index));
  };

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => new Set(prev).add(index));
  };

  // Auto-slideshow functionality - disabled by default for better user control
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    // Uncomment below to enable auto-slideshow
    // const interval = setInterval(() => {
    //   setSelectedImage(prev => (prev + 1) % productImages.length);
    // }, 4000); // Change image every 4 seconds

    // return () => clearInterval(interval);
  }, [hasMultipleImages, productImages.length]);

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

  const nextImage = () => {
    if (hasMultipleImages) {
      setImageLoading(true);
      setSelectedImage((prev) => (prev + 1) % productImages.length);
      setTimeout(() => setImageLoading(false), 200);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setImageLoading(true);
      setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
      setTimeout(() => setImageLoading(false), 200);
    }
  };

  const selectImage = (index: number) => {
    if (index >= 0 && index < productImages.length) {
      setImageLoading(true);
      setSelectedImage(index);
      setTimeout(() => setImageLoading(false), 200);
    }
  };

  // Reset selected image if it's out of bounds
  useEffect(() => {
    if (selectedImage >= productImages.length) {
      setSelectedImage(0);
    }
  }, [selectedImage, productImages.length]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextImage();
      } else if (event.key === 'Escape' && isImageFullscreen) {
        event.preventDefault();
        setIsImageFullscreen(false);
      }
    };

    if (hasMultipleImages || isImageFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMultipleImages, isImageFullscreen, prevImage, nextImage]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.69.97.99-3.59-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                    </svg>
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
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Enhanced Image Gallery with Slideshow */}
          <div className="space-y-6">
            {/* Main Image Display */}
            <div className="relative group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg relative">
                {/* Loading skeleton */}
                {!imagesLoaded.has(selectedImage) && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-16 h-16 text-gray-400">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  </div>
                )}
                
                <img 
                  src={imageErrors.has(selectedImage) ? '/1G5A2160.jpg' : currentImageUrl}
                  alt={`${product.name} - High quality product image ${selectedImage + 1}`}
                  onError={() => handleImageError(selectedImage)}
                  onLoad={() => handleImageLoad(selectedImage)}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    imagesLoaded.has(selectedImage) ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  } ${imageLoading ? 'blur-sm' : ''}`}
                  loading="eager"
                />
                
                {/* Image quality indicator */}
                {imagesLoaded.has(selectedImage) && !imageErrors.has(selectedImage) && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    HD Quality
                  </div>
                )}

                {/* Navigation Arrows - Enhanced */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Fullscreen Button */}
                <button
                  onClick={() => setIsImageFullscreen(true)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <Expand className="w-5 h-5" />
                </button>

                {/* Enhanced Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-4 px-4 py-2 bg-black bg-opacity-75 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20">
                    {selectedImage + 1} / {productImages.length}
                  </div>
                )}
                
                {/* Image Navigation Instructions */}
                {hasMultipleImages && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black bg-opacity-60 backdrop-blur-sm text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                    Click arrows or thumbnails to navigate
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Thumbnail Navigation */}
            {hasMultipleImages && (
              <div className="grid grid-cols-5 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm transition-all cursor-pointer relative ${
                      selectedImage === index 
                        ? 'ring-3 ring-black shadow-lg scale-105' 
                        : 'hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    {/* Thumbnail loading skeleton */}
                    {!imagesLoaded.has(index) && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="w-4 h-4 text-gray-400">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    <img
                      src={imageErrors.has(index) ? '/1G5A2160.jpg' : image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imagesLoaded.has(index) ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                    />
                    
                    {/* Active indicator */}
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}            {/* Enhanced Image Indicators */}
            {hasMultipleImages && (
              <div className="flex justify-center space-x-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`w-3 h-3 rounded-full transition-all border ${
                      selectedImage === index 
                        ? 'bg-black border-black scale-125' 
                        : 'bg-gray-300 border-gray-300 hover:bg-gray-400 hover:border-gray-400 hover:scale-110'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col h-full">
              <div className="border-b pb-6">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">{product.name}</h1>
                <div className="flex items-baseline gap-3 mb-4">
                  <p className="text-4xl font-bold text-black">R {product.price.toFixed(2)}</p>
                  <span className="text-gray-500 text-lg">incl. VAT</span>
                </div>
                
                {/* Product Category */}
                {product.category && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Availability:</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    In Stock - Ready to Ship
                  </span>
                </div>
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
                  <div className="space-y-8">
                    {/* Product Description */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Product Description</h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                      </div>
                    </div>
                    
                    {/* Available Sizes */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Available Sizes</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {((product as any).sizes || (product as any).size || []).map((size: string) => (
                          <div
                            key={size}
                            className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-center font-semibold text-lg bg-white shadow-sm"
                          >
                            {size}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        Select your preferred size when adding to cart
                      </p>
                    </div>

                    {/* Product Features */}
                    {product.features && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                        <ul className="space-y-3">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-600">
                              <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Care Instructions */}
                    {product.care && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Care Instructions</h3>
                        <ul className="space-y-3">
                          {product.care.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-600">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

              {/* Enhanced Action Buttons */}
              <div className="pt-6 mt-6 border-t space-y-4">
                <button
                  onClick={() => onAddToCart && onAddToCart(product)}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
                    className="w-full py-3 px-6 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.69.97.99-3.59-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                    </svg>
                    Inquire on WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Fullscreen Image Modal */}
      {isImageFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
            <img
              src={currentImageUrl}
              alt={`${product.name} - Fullscreen view ${selectedImage + 1}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/1G5A2160.jpg') {
                  target.src = '/1G5A2160.jpg';
                }
              }}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsImageFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
              aria-label="Close fullscreen view"
            >
              ×
            </button>
            
            {/* Image Counter in Fullscreen */}
            {hasMultipleImages && (
              <div className="absolute top-4 left-4 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                {selectedImage + 1} / {productImages.length}
              </div>
            )}
            
            {/* Navigation in Fullscreen */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
            
            {/* Keyboard Navigation Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white text-xs rounded-full">
              Use arrow keys or click buttons to navigate • ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}