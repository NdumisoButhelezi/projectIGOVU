import React from 'react';
import { Shield, Target, Heart, Star, Award, Users, TrendingUp, Sparkles, Truck } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">About IGOVU</h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Established in 2018, IGOVU is more than just a clothing brand - it's a movement of motivation and courage.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Story */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Story</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-xl mb-6">
                The message behind IGOVU is to motivate and encourage people through clothing to never give up on their dreams despite life's challenges. We inspire individuals to be strong, brave, and bold like Igovu.
              </p>
              <p className="text-xl mb-6">
                When wearing our clothing, we want people to embrace the spirit of being the top dog - to have courage, confidence, and wear clothes that reflect how they want to feel: bold, smart, and approachable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Values */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Brand Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our core values shape everything we do at IGOVU
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Shield className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">Brand Personality</h3>
              <p className="text-gray-600">
                Inspired by the character of Igovu - gaining attention and recognition at first appearance.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Target className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To create clothing that empowers people to become unstoppable and vanquish their obstacles.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Heart className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">Core Values</h3>
              <p className="text-gray-600">
                Boldness, bravery, confidence, courage, and perseverance in everything we do.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Star className="w-12 h-12 mx-auto mb-6 text-black group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-4">Quality</h3>
              <p className="text-gray-600">
                Commitment to excellence in every piece we create.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Goals */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vision for 2025</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our roadmap for growth and impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-2xl">
              <Award className="w-12 h-12 text-black mb-6" />
              <h3 className="text-xl font-semibold mb-4">Sustainable Growth</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Expand market presence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Build customer community</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Increase brand recognition</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gray-50 rounded-2xl">
              <Target className="w-12 h-12 text-black mb-6" />
              <h3 className="text-xl font-semibold mb-4">Customer Experience</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Fast payment options</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span>Quick order delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Quality assurance</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gray-50 rounded-2xl">
              <Heart className="w-12 h-12 text-black mb-6" />
              <h3 className="text-xl font-semibold mb-4">Community Impact</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Inspire confidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Build relationships</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Create lasting impact</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}