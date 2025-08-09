import { useState, useEffect } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface GalleryProps {
  products: Product[];
}

interface MediaItem {
  src: string;
  type: 'image' | 'video';
  title: string;
  category: 'brand' | 'product';
  fallback?: string; // Added fallback property
}

export default function Gallery({ products }: GalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'brand' | 'product'>('all');

  // Combine brand media with product images
  const brandMedia: MediaItem[] = [
    { 
      src: '/1G5A2109-copy.jpg', 
      type: 'image', 
      title: 'IGOVU Collection Showcase', 
      category: 'brand',
      fallback: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    },
    { 
      src: '/1G5A2104.jpg', 
      type: 'image', 
      title: 'Bold Fashion Statement', 
      category: 'brand',
      fallback: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800'
    },
    { src: '/1G5A2081.jpg', type: 'image', title: 'Premium Quality', category: 'brand' },
    { src: '/1G5A2039.jpg', type: 'image', title: 'IGOVU Community', category: 'brand' },
    { src: '/1G5A2160.jpg', type: 'image', title: 'IGOVU Style Collection', category: 'brand' },
    { src: '/1G5A2179.jpg', type: 'image', title: 'Premium Streetwear', category: 'brand' },
    { src: '/cold.mp4', type: 'video', title: 'IGOVU Experience Video', category: 'brand' },
    { src: '/igovu-experience-video.mp4', type: 'video', title: 'Style Collection', category: 'brand' },
    { src: '/Igovu2.mp4', type: 'video', title: 'Bold Expression', category: 'brand' }
  ];

  const productMedia: MediaItem[] = products.flatMap(product => 
    product.images?.map((image, index) => ({
      src: image,
      type: 'image' as const,
      title: `${product.name} - View ${index + 1}`,
      category: 'product' as const
    })) || []
  );

  const allMedia = [...brandMedia, ...productMedia];
  
  const filteredMedia = filter === 'all' ? allMedia : 
                       filter === 'brand' ? brandMedia : productMedia;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedMedia && filteredMedia.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedMedia, filteredMedia.length]);

  const handlePrevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  };

  const handleNextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
  };

  const handleVideoPlayPause = (videoElement: HTMLVideoElement) => {
    if (videoElement.paused) {
      videoElement.play();
      setIsVideoPlaying(true);
    } else {
      videoElement.pause();
      setIsVideoPlaying(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/cold.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-lg">
              IGOVU Gallery
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-md">
              Explore our collection through stunning visuals and exclusive content
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-xl p-2 inline-flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  filter === 'all' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                All Media ({allMedia.length})
              </button>
              <button
                onClick={() => setFilter('brand')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  filter === 'brand' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                Brand Content ({brandMedia.length})
              </button>
              <button
                onClick={() => setFilter('product')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  filter === 'product' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                Products ({productMedia.length})
              </button>
            </div>
          </div>

          {/* Featured Media Carousel */}
          {filteredMedia.length > 0 && (
            <div className="relative h-[70vh] mb-16 rounded-2xl overflow-hidden group bg-black">
              {filteredMedia[currentIndex].type === 'image' ? (
                <img
                  src={filteredMedia[currentIndex].src}
                  alt={filteredMedia[currentIndex].title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out transform hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (filteredMedia[currentIndex].fallback) {
                      target.src = filteredMedia[currentIndex].fallback;
                    }
                  }}
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    className="w-full h-full object-cover"
                    loop
                    muted
                    onLoadedData={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.play();
                      setIsVideoPlaying(true);
                    }}
                  >
                    <source src={filteredMedia[currentIndex].src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Overlay Controls */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const video = e.currentTarget.parentElement?.querySelector('video');
                        if (video) handleVideoPlayPause(video);
                      }}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
                    >
                      {isVideoPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Navigation Arrows */}
              <button
                onClick={handlePrevMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Media Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-xl font-bold mb-2">{filteredMedia[currentIndex].title}</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filteredMedia[currentIndex].category === 'brand' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {filteredMedia[currentIndex].category === 'brand' ? 'Brand Content' : 'Product'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filteredMedia[currentIndex].type === 'video' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {filteredMedia[currentIndex].type === 'video' ? 'Video' : 'Image'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedia.map((media, index) => (
              <div
                key={`${media.src}-${index}`}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                  index === currentIndex ? 'ring-4 ring-black shadow-2xl' : ''
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setSelectedMedia(media);
                }}
              >
                {media.type === 'image' ? (
                  <img
                    src={media.src}
                    alt={media.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="relative w-full h-full bg-black">
                    <video
                      className="w-full h-full object-cover"
                      muted
                    >
                      <source src={media.src} type="video/mp4" />
                    </video>
                    
                    {/* Video Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                {/* Media Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="text-white text-sm font-semibold truncate">{media.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      media.category === 'brand' ? 'bg-green-500' : 'bg-blue-500'
                    } text-white`}>
                      {media.category === 'brand' ? 'Brand' : 'Product'}
                    </span>
                    {media.type === 'video' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                        Video
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <video
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                controls
                autoPlay
              >
                <source src={selectedMedia.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            
            {/* Close Button */}
            <button
              className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl hover:bg-gray-200 transition-colors"
              onClick={() => setSelectedMedia(null)}
            >
              ✕
            </button>
            
            {/* Media Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-bold mb-2">{selectedMedia.title}</h3>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMedia.category === 'brand' ? 'bg-green-500' : 'bg-blue-500'
                } text-white`}>
                  {selectedMedia.category === 'brand' ? 'Brand Content' : 'Product'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMedia.type === 'video' ? 'bg-red-500' : 'bg-gray-500'
                } text-white`}>
                  {selectedMedia.type === 'video' ? 'Video Content' : 'Image'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}