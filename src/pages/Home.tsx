import React from 'react';
import { ShoppingBag, TrendingUp, Truck, CreditCard, ArrowRight, Star, Shield, Heart } from 'lucide-react';

interface HomeProps {
  onShopClick: () => void;
}

export default function Home({ onShopClick }: HomeProps) {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              IGOVU CLOTHING BRAND
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Embrace the spirit of being the top dog. Be bold, be brave, be IGOVU.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={onShopClick} className="btn-primary flex items-center gap-2 group">
                Shop Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Values */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose IGOVU?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Established in 2018, IGOVU is more than just clothing - it's a statement of courage and determination.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group p-8 bg-gray-50 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Bold Identity</h3>
              <p className="text-gray-600">
                Stand out and make a statement with clothing that reflects your confidence and courage.
              </p>
            </div>

            <div className="group p-8 bg-gray-50 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-gray-600">
                Each piece is crafted with attention to detail and the highest quality materials.
              </p>
            </div>

            <div className="group p-8 bg-gray-50 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-gray-600">
                Join a community of brave individuals who dare to dream and achieve.
              </p>
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

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CreditCard className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">2. Confirm Your Order</h3>
              <p className="text-gray-600">Pay 60% or 100% upfront to confirm your order</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <TrendingUp className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">3. Order Processing</h3>
              <p className="text-gray-600">Your order enters our customer orders list</p>
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
          <div className="bg-black text-white rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Payment Options</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Multiple secure payment methods available for your convenience
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-white/10 rounded-xl backdrop-blur-lg">
                  <h3 className="text-xl font-semibold mb-4">Yoco Payments</h3>
                  <p className="text-gray-300">Secure online payments via Yoco payment link</p>
                </div>
                <div className="p-6 bg-white/10 rounded-xl backdrop-blur-lg">
                  <h3 className="text-xl font-semibold mb-4">eWallet</h3>
                  <p className="text-gray-300">Quick and easy eWallet transfers</p>
                </div>
                <div className="p-6 bg-white/10 rounded-xl backdrop-blur-lg">
                  <h3 className="text-xl font-semibold mb-4">In-Person</h3>
                  <p className="text-gray-300">Available in Durban and Joburg areas</p>
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