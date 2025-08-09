import React, { useState } from 'react';
import { ShoppingCart, Settings, Home, Phone, Info, Menu, Image, Users, LogOut, LogIn } from 'lucide-react';
import { Page } from '../types';
import MobileNav from './MobileNav';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  cartItemCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  currentPage: string;
  onNavigate: (page: Page) => void;
  onOpenAuth: () => void;
}

export default function Navbar({ 
  cartItemCount, 
  onCartClick, 
  onAdminClick, 
  currentPage, 
  onNavigate,
  onOpenAuth 
}: NavbarProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileNavOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <h1 
                onClick={() => onNavigate('home')}
                className="text-2xl font-bold ml-4 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent cursor-pointer"
              >
                IGOVU
              </h1>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <button 
                onClick={() => onNavigate('home')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'home' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              <button 
                onClick={() => onNavigate('items')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'items' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Items</span>
              </button>
              <button 
                onClick={() => onNavigate('men')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'men' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Men</span>
              </button>
              <button 
                onClick={() => onNavigate('women')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'women' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Women</span>
              </button>
              <button 
                onClick={() => onNavigate('gallery')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'gallery' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Image className="h-4 w-4" />
                <span>Gallery</span>
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'about' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className={`flex items-center gap-2 transition-colors ${
                  currentPage === 'contact' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </button>
              <Link to="/order-history" className="px-4 py-2 hover:underline mt-2">Order History</Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAdmin && (
                <button 
                  onClick={onAdminClick}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-all transform hover:scale-110"
                  title="Admin Panel"
                >
                  <Settings className="h-6 w-6" />
                </button>
              )}
              
              {currentUser ? (
                <>
                  <button 
                    onClick={onCartClick}
                    className="relative p-2 transition-all transform hover:scale-110"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-all transform hover:scale-110"
                    title="Log Out"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-all transform hover:scale-110"
                  title="Log In"
                >
                  <LogIn className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
    </>
  );
}