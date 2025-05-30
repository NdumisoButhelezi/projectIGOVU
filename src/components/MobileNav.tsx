import React from 'react';
import { X } from 'lucide-react';
import { Page } from '../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: Page) => void;
}

export default function MobileNav({ isOpen, onClose, currentPage, onNavigate }: MobileNavProps) {
  const handleNavigate = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              IGOVU
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="space-y-4">
            {[
              { id: 'home', label: 'Home' },
              { id: 'items', label: 'Items' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'about', label: 'About' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as Page)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}