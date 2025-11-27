/**
 * Example: Simple Image Upload Component using Firebase Storage
 * This demonstrates how easy it is to use the new Firebase Storage integration
 */

import React, { useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { uploadImage, deleteImage } from '../services/firebase-storage';

export default function SimpleImageUpload() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePath, setImagePath] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Upload with automatic compression
      const result = await uploadImage(file, 'products', true);
      
      setImageUrl(result.url);
      setImagePath(result.path);
      
      console.log('Upload successful!', {
        url: result.url,
        path: result.path,
        size: `${Math.round(result.size / 1024)}KB`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!imagePath) return;

    try {
      await deleteImage(imagePath);
      setImageUrl('');
      setImagePath('');
      console.log('Image deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple Image Upload</h2>

      {/* Upload Area */}
      {!imageUrl ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      ) : (
        /* Image Preview */
        <div className="relative">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uploading && (
        <div className="mt-4 flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
          Uploading...
        </div>
      )}

      {imageUrl && !uploading && (
        <div className="mt-4 flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          Upload successful!
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Image Info */}
      {imageUrl && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Image Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="break-all">
              <span className="font-medium">URL:</span> {imageUrl}
            </p>
            <p>
              <span className="font-medium">Path:</span> {imagePath}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
