import React, { useState, useCallback } from 'react';
import { Product } from '../types';
import { X, Upload, Plus, Minus, Image as ImageIcon, Camera, Trash2 } from 'lucide-react';

interface AdminUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
}

async function createYocoCheckout(payload: any, token: string) {
  // Call your backend proxy instead of Yoco directly
  const res = await fetch('http://localhost:4000/api/yoco-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, token }),
  });
  if (!res.ok) {
    throw new Error('Failed to create Yoco checkout');
  }
  return await res.json();
}

export default function AdminUpload({ isOpen, onClose, onSubmit }: AdminUploadProps) {
  const [sizes, setSizes] = useState<string[]>(['']);
  const [images, setImages] = useState<string[]>(['']);
  const [features, setFeatures] = useState<string[]>(['']);
  const [care, setCare] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    gender: 'men' as 'men' | 'women',
    color: '',
    collection: '',
    material: '',
    fit: '',
    occasion: '',
    season: '',
    brand: '',
    sku: '',
    stock: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages(prev => {
          const newImages = [...prev];
          newImages[index] = base64String;
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleArrayChange = (
    index: number,
    value: string,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArray(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleArrayAdd = (setArray: React.Dispatch<React.SetStateAction<string[]>>) => {
    setArray(prev => [...prev, '']);
  };

  const handleArrayRemove = (index: number, setArray: React.Dispatch<React.SetStateAction<string[]>>) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredArrays = {
      sizes: sizes.filter(size => size.trim() !== ''),
      images: images.filter(image => image.trim() !== ''),
      features: features.filter(feature => feature.trim() !== ''),
      care: care.filter(item => item.trim() !== '')
    };

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      size: filteredArrays.sizes,
      images: filteredArrays.images,
      features: filteredArrays.features,
      care: filteredArrays.care
    });
    
    // Reset form
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      gender: 'men',
      color: '',
      collection: '',
      material: '',
      fit: '',
      occasion: '',
      season: '',
      brand: '',
      sku: '',
      stock: ''
    });
    setSizes(['']);
    setImages(['']);
    setFeatures(['']);
    setCare(['']);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              Add New Product
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors transform hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Images Section */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Product Images
                </h3>
                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={() => handleArrayAdd(setImages)}
                    className="flex items-center text-sm text-black hover:text-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Image
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-black transition-colors">
                      {image ? (
                        <div className="relative">
                          <img
                            src={image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleArrayRemove(index, setImages)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(index, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rest of the form sections... */}
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-semibold mb-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Collection</label>
                  <input
                    type="text"
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fit</label>
                  <input
                    type="text"
                    name="fit"
                    value={formData.fit}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Occasion</label>
                  <input
                    type="text"
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Season</label>
                  <input
                    type="text"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>

            {/* Sizes */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Sizes</h3>
                <button
                  type="button"
                  onClick={() => handleArrayAdd(setSizes)}
                  className="flex items-center text-sm text-black hover:text-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Size
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sizes.map((size, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleArrayChange(index, e.target.value, sizes, setSizes)}
                      placeholder="e.g., S, M, L, XL"
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleArrayRemove(index, setSizes)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Features</h3>
                <button
                  type="button"
                  onClick={() => handleArrayAdd(setFeatures)}
                  className="flex items-center text-sm text-black hover:text-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </button>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange(index, e.target.value, features, setFeatures)}
                      placeholder="Enter product feature"
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleArrayRemove(index, setFeatures)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Care Instructions</h3>
                <button
                  type="button"
                  onClick={() => handleArrayAdd(setCare)}
                  className="flex items-center text-sm text-black hover:text-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Instruction
                </button>
              </div>
              <div className="space-y-3">
                {care.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => handleArrayChange(index, e.target.value, care, setCare)}
                      placeholder="Enter care instruction"
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                    {care.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleArrayRemove(index, setCare)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}