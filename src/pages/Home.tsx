import React from 'react';
import { ShoppingBag, TrendingUp, Truck, CreditCard, ArrowRight, Star, Shield, Heart, ChevronDown } from 'lucide-react';

interface HomeProps {
  onShopClick: () => void;
}

export default function Home({ onShopClick }: HomeProps) {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section - Full Height */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white min-h-screen flex flex-col overflow-hidden">
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
          <source src="/videos/cold.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex-1 flex flex-col justify-center z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-lg">
              IGOVU CLOTHING BRAND
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Embrace the spirit of being the top dog. Be bold, be brave, be IGOVU.
            </p>
            <div className="flex justify-center gap-4 mb-16">
              <button onClick={onShopClick} className="btn-primary flex items-center gap-2 group shadow-xl">
                Shop Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="btn-secondary shadow-xl">
                Learn More
              </button>
            </div>

            {/* Dual Video Section with More Spacing */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-12 lg:gap-24 xl:gap-32 mt-16">
              {/* First Video - Desktop Phone Frame */}
              <div className="relative group">
                <div className="hidden md:block relative">
                  <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl ring-1 ring-gray-900/10">
                    <div className="relative bg-black rounded-[2.5rem] p-2">
                      <div className="relative bg-white rounded-[2rem] overflow-hidden w-72 h-[580px]">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-10"></div>
                        
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative">
                          <video
                            className="w-full h-full object-cover absolute inset-0"
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{ display: 'none' }}
                            onCanPlay={(e) => {
                              e.currentTarget.style.display = 'block';
                              const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback');
                              if (fallback) fallback.classList.add('opacity-0');
                            }}
                            onError={() => {}}
                          >
                            <source src="/videos/igovu-experience-video.mp4" type="video/mp4" />
                            <source src="/igovu-experience-video.mp4" type="video/mp4" />
                          </video>
                          
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white video-fallback transition-opacity duration-500">
                            <div className="text-center p-6 relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
                                <div className="w-0 h-0 border-l-10 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                              </div>
                              <h3 className="text-lg font-bold mb-2">IGOVU Style</h3>
                              <p className="text-xs text-gray-300 mb-3">Premium Collection</p>
                              <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce delay-150"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-white rounded-full opacity-60"></div>
                    </div>
                  </div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] pointer-events-none"></div>
                </div>

                {/* Mobile Version 1 - Side by Side */}
                <div className="md:hidden flex justify-center">
                  <div className="flex gap-6 items-center">
                    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl overflow-hidden shadow-2xl w-40 h-64">
                      <video
                        className="w-full h-full object-cover absolute inset-0"
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ display: 'none' }}
                        onCanPlay={(e) => {
                          e.currentTarget.style.display = 'block';
                          const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback');
                          if (fallback) fallback.classList.add('opacity-0');
                        }}
                        onError={() => {}}
                      >
                        <source src="/videos/igovu-experience-video.mp4" type="video/mp4" />
                        <source src="/igovu-experience-video.mp4" type="video/mp4" />
                      </video>
                      
                      <div className="relative h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white video-fallback transition-opacity duration-500">
                        <div className="text-center p-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border border-white/20">
                            <div className="w-0 h-0 border-l-6 border-l-white border-t-3 border-t-transparent border-b-3 border-b-transparent ml-1"></div>
                          </div>
                          <h3 className="text-sm font-bold mb-1">IGOVU Style</h3>
                          <p className="text-xs text-gray-300">Premium</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl overflow-hidden shadow-2xl w-40 h-64">
                      <video
                        className="w-full h-full object-cover absolute inset-0"
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ display: 'none' }}
                        onCanPlay={(e) => {
                          e.currentTarget.style.display = 'block';
                          const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback');
                          if (fallback) fallback.classList.add('opacity-0');
                        }}
                        onError={() => {}}
                      >
                        <source src="/videos/Igovu2.mp4" type="video/mp4" />
                        <source src="/Igovu2.mp4" type="video/mp4" />
                      </video>
                      
                      <div className="relative h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white video-fallback transition-opacity duration-500">
                        <div className="text-center p-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border border-white/20">
                            <div className="w-0 h-0 border-l-6 border-l-white border-t-3 border-t-transparent border-b-3 border-b-transparent ml-1"></div>
                          </div>
                          <h3 className="text-sm font-bold mb-1">IGOVU Life</h3>
                          <p className="text-xs text-gray-300">Bold</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Video - Desktop Phone Frame */}
              <div className="relative group">
                <div className="hidden md:block relative">
                  <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl ring-1 ring-gray-900/10">
                    <div className="relative bg-black rounded-[2.5rem] p-2">
                      <div className="relative bg-white rounded-[2rem] overflow-hidden w-72 h-[580px]">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-10"></div>
                        
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative">
                          <video
                            className="w-full h-full object-cover absolute inset-0"
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{ display: 'none' }}
                            onCanPlay={(e) => {
                              e.currentTarget.style.display = 'block';
                              const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback');
                              if (fallback) fallback.classList.add('opacity-0');
                            }}
                            onError={() => {}}
                          >
                            <source src="/videos/Igovu2.mp4" type="video/mp4" />
                            <source src="/Igovu2.mp4" type="video/mp4" />
                          </video>
                          
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white video-fallback transition-opacity duration-500">
                            <div className="text-center p-6 relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
                                <div className="w-0 h-0 border-l-10 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                              </div>
                              <h3 className="text-lg font-bold mb-2">IGOVU Life</h3>
                              <p className="text-xs text-gray-300 mb-3">Bold Expression</p>
                              <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce delay-150"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-white rounded-full opacity-60"></div>
                    </div>
                  </div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-red-500 rounded-full animate-bounce delay-75"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] pointer-events-none"></div>
                </div>

                {/* Mobile Version 2 - Hidden since both videos are now in first container */}
                <div className="hidden">
                  <div className="md:hidden w-full max-w-xs mx-auto">
                    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                      <video
                        className="w-full h-80 object-cover absolute inset-0"
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ display: 'none' }}
                        onCanPlay={(e) => {
                          e.currentTarget.style.display = 'block';
                          const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback');
                          if (fallback) fallback.classList.add('opacity-0');
                        }}
                        onError={() => {}}
                      >
                        <source src="/videos/Igovu2.mp4" type="video/mp4" />
                        <source src="/Igovu2.mp4" type="video/mp4" />
                      </video>
                      
                      <div className="relative h-80 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white video-fallback transition-opacity duration-500">
                        <div className="text-center p-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
                            <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                          </div>
                          <h3 className="text-base font-bold mb-1">IGOVU Life</h3>
                          <p className="text-xs text-gray-300">Bold Expression</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-sm text-gray-200 font-medium drop-shadow-md">Experience IGOVU</p>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-20">
            <p className="text-sm text-gray-200 mb-2 drop-shadow-md">Scroll to explore</p>
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-white mx-auto drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Brand Values Section with Images */}
      <div className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose IGOVU?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Established in 2018, IGOVU is more than just clothing - it's a statement of courage and determination.
            </p>
          </div>
          
          <div className="space-y-32">
            {/* Bold Identity */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <img 
                  src="/1G5A2104.jpg" 
                  alt="Bold Fashion Statement - IGOVU Collection" 
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black rounded-full flex items-center justify-center shadow-xl">
                  <Shield className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-2xl mb-6">
                  <Shield className="w-10 h-10" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Bold Identity</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Stand out and make a statement with clothing that reflects your confidence and courage. 
                  Our designs are crafted for those who dare to be different and embrace their unique style.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Unique designs that make you stand out</span>
                </div>
              </div>
            </div>

            {/* Premium Quality */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 space-y-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-2xl mb-6">
                  <Star className="w-10 h-10" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Premium Quality</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Each piece is crafted with attention to detail and the highest quality materials. 
                  We believe in creating clothing that not only looks great but lasts for years to come.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Premium materials and craftsmanship</span>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <img 
                  src="/1G5A2081.jpg" 
                  alt="Premium Quality - IGOVU Clothing" 
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                  <Star className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <img 
                  src="/1G5A2039.jpg" 
                  alt="IGOVU Community - Bold and Brave" 
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                  <Heart className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-2xl mb-6">
                  <Heart className="w-10 h-10" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Community</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join a community of brave individuals who dare to dream and achieve. 
                  IGOVU is more than fashion - it's a movement of people who support each other's journey to greatness.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Join a supportive community of achievers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Order Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Place an Order</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and convenient ordering process
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <ShoppingBag className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">1. Choose Your Items</h3>
              <p className="text-gray-600">Browse our collection and select your favorite pieces</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 border-green-200">
              <CreditCard className="w-12 h-12 mx-auto mb-6 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4 text-green-700">2. Confirm Your Order</h3>
              <p className="text-gray-600">Pay the full amount online to secure your order</p>
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full inline-block">
                100% Payment Required
              </div>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <TrendingUp className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">3. Order Processing</h3>
              <p className="text-gray-600">Your order enters our production queue immediately</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Truck className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">4. Delivery</h3>
              <p className="text-gray-600">Free delivery for 2+ items, R100 for single items via PAXi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="text-center mb-12 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Secure Online Payment</h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Fast, secure, and convenient online payment processing for your peace of mind
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="grid md:grid-cols-1 gap-8">
                <div className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">✓</span>
                    </div>
                    <h3 className="text-2xl font-bold">Website Payment Only</h3>
                  </div>
                  <p className="text-gray-300 text-lg mb-6">
                    All payments are processed securely through our website using trusted payment gateways
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2">Yoco Payments</h4>
                      <p className="text-gray-400 text-sm">Secure card processing with instant confirmation</p>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-sm">₿</span>
                      </div>
                      <h4 className="font-semibold mb-2">Digital Wallets</h4>
                      <p className="text-gray-400 text-sm">Quick and easy electronic wallet transfers</p>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2">Secure & Fast</h4>
                      <p className="text-gray-400 text-sm">SSL encrypted with instant order processing</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-green-400 font-bold text-lg">💡</span>
                      <span className="ml-2 font-semibold text-green-300">Payment Policy</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Full payment is required at checkout to secure your order and begin production
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Statement?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the IGOVU movement and embrace your bold, brave spirit
          </p>
          <button onClick={onShopClick} className="inline-flex items-center gap-2 btn-primary group">
            Shop Collection <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}