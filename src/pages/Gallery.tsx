import React, { useState, useEffect } from 'react';
import { products } from '../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const allImages = products.flatMap(product => product.images);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedImage) {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedImage, allImages.length]);

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              IGOVU Gallery
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Explore our collection through stunning visuals
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Image Carousel */}
          <div className="relative h-[70vh] mb-16 rounded-2xl overflow-hidden group">
            <img
              src={allImages[currentIndex]}
              alt="Featured"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out transform hover:scale-105"
            />
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-w-3 aspect-h-4 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  index === currentIndex ? 'ring-4 ring-black' : ''
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setSelectedImage(image);
                }}
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-xl"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}