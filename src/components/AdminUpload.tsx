import React, { useState, useCallback } from 'react';
import { X, Upload, Plus, Minus, Image as ImageIcon, Camera, Trash2 } from 'lucide-react';

interface AdminUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: any) => void;
  initialProduct?: any;
}

export default function AdminUpload({ isOpen, onClose, onSubmit, initialProduct }: AdminUploadProps) {
  const [sizes, setSizes] = useState<string[]>(initialProduct?.sizes || ['']);
  const [images, setImages] = useState<string[]>(initialProduct?.images || ['']);
  const [features, setFeatures] = useState<string[]>(initialProduct?.features || ['']);
  const [care, setCare] = useState<string[]>(initialProduct?.care || ['']);
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    price: initialProduct?.price?.toString() || '',
    category: initialProduct?.category || '',
    description: initialProduct?.description || '',
    gender: initialProduct?.gender || 'men',
    color: initialProduct?.color || '',
    collection: initialProduct?.collection || '',
    material: initialProduct?.material || '',
    fit: initialProduct?.fit || '',
    occasion: initialProduct?.occasion || '',
    season: initialProduct?.season || '',
    brand: initialProduct?.brand || '',
    sku: initialProduct?.sku || '',
    stock: initialProduct?.stock?.toString() || '',
    length_cm: initialProduct?.length_cm?.toString() || '',
    width_cm: initialProduct?.width_cm?.toString() || '',
    height_cm: initialProduct?.height_cm?.toString() || '',
    weight_kg: initialProduct?.weight_kg?.toString() || '',
    measurement_unit: initialProduct?.measurement_unit || 'cm',
    weight_unit: initialProduct?.weight_unit || 'kg'
  });

  // Dropdown options for South African clothing context
  const categoryOptions = [
    'Hoodies', 'Pants', 'T-Shirts', 'Jackets', 'Shorts', 'Tracksuits', 'Dresses', 'Accessories', 'Caps', 'Sneakers', 'Other'
  ];
  const colorOptions = [
    'Black', 'White', 'Grey', 'Blue', 'Red', 'Green', 'Yellow', 'Brown', 'Beige', 'Navy', 'Olive', 'Maroon', 'Pink', 'Orange', 'Purple', 'Other'
  ];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'One Size'];
  const collectionOptions = [
    'Essentials', 'Streetwear', 'Limited', 'Seasonal', 'Heritage', 'SA Pride', 'Other'
  ];
  const materialOptions = [
    'Cotton', 'Cotton Blend', 'Polyester', 'Fleece', 'Denim', 'Linen', 'Wool', 'Acrylic', 'Other'
  ];
  const fitOptions = ['Regular', 'Slim', 'Oversized', 'Relaxed', 'Tapered', 'Other'];
  const occasionOptions = ['Casual', 'Formal', 'Sports', 'Outdoor', 'Traditional', 'Heritage Day', 'Other'];
  const seasonOptions = ['All', 'Summer', 'Winter', 'Spring', 'Autumn'];

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
    _array: string[],
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

  // On submit, convert dimension/weight fields to numbers if present
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only include fields that are filled in
    const productData: any = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
    };
    if (initialProduct?.id) productData.id = initialProduct.id;
    if (formData.gender) productData.gender = formData.gender;
    if (formData.color) productData.color = formData.color;
    if (formData.collection) productData.collection = formData.collection;
    if (formData.material) productData.material = formData.material;
    if (formData.fit) productData.fit = formData.fit;
    if (formData.occasion) productData.occasion = formData.occasion;
    if (formData.season) productData.season = formData.season;
    if (formData.brand) productData.brand = formData.brand;
    if (formData.sku) productData.sku = formData.sku;
    if (formData.stock) productData.stock = Number(formData.stock);
    if (formData.length_cm) productData.length_cm = Number(formData.length_cm);
    if (formData.width_cm) productData.width_cm = Number(formData.width_cm);
    if (formData.height_cm) productData.height_cm = Number(formData.height_cm);
    if (formData.weight_kg) productData.weight_kg = Number(formData.weight_kg);
    if (formData.measurement_unit) productData.measurement_unit = formData.measurement_unit;
    if (formData.weight_unit) productData.weight_unit = formData.weight_unit;
    if (formData.description) productData.description = formData.description;
    const filteredSizes = sizes.filter(Boolean);
    if (filteredSizes.length) productData.sizes = filteredSizes;
    const filteredImages = images.filter(Boolean);
    if (filteredImages.length) productData.images = filteredImages;
    const filteredFeatures = features.filter(Boolean);
    if (filteredFeatures.length) productData.features = filteredFeatures;
    const filteredCare = care.filter(Boolean);
    if (filteredCare.length) productData.care = filteredCare;

    onSubmit(productData);
    onClose();
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
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                    <option value="unisex">Unisex</option>
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
                  <select
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select color</option>
                    {colorOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Collection</label>
                  <select
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select collection</option>
                    {collectionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Material</label>
                  <select
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select material</option>
                    {materialOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fit</label>
                  <select
                    name="fit"
                    value={formData.fit}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select fit</option>
                    {fitOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Occasion</label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select occasion</option>
                    {occasionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Season</label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  >
                    <option value="">Select season</option>
                    {seasonOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Length</label>
                    <input
                      type="number"
                      name="length_cm"
                      min="1"
                      step="0.1"
                      value={formData.length_cm}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g. 30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Width</label>
                    <input
                      type="number"
                      name="width_cm"
                      min="1"
                      step="0.1"
                      value={formData.width_cm}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g. 25"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height</label>
                    <input
                      type="number"
                      name="height_cm"
                      min="1"
                      step="0.1"
                      value={formData.height_cm}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g. 8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight</label>
                    <input
                      type="number"
                      name="weight_kg"
                      min="0.01"
                      step="0.01"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g. 0.7"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Measurement Unit</label>
                    <select
                      name="measurement_unit"
                      value={formData.measurement_unit}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="in">inches</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight Unit</label>
                    <select
                      name="weight_unit"
                      value={formData.weight_unit}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
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
                    <select
                      value={size}
                      onChange={e => handleArrayChange(index, e.target.value, sizes, setSizes)}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    >
                      <option value="">Select size</option>
                      {sizeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
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
                {initialProduct ? 'Update Product' : 'Upload Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}