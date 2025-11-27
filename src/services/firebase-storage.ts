/**
 * Firebase Storage service for product image management
 * Handles upload, delete, and URL retrieval for product images
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadMetadata
} from 'firebase/storage';
import { storage } from '../config/firebase';
import { compressImage, validateImageFile } from '../utils/image-compression';

/**
 * Upload result containing the public URL and storage path
 */
export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Generates a unique filename with timestamp to prevent collisions
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  return `${sanitizedName}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Uploads an image to Firebase Storage
 * @param file - Image file to upload
 * @param folder - Storage folder path (e.g., 'products', 'products/thumbnails')
 * @param compress - Whether to compress the image before upload (default: true)
 * @returns Promise with upload result containing URL and path
 */
export async function uploadImage(
  file: File,
  folder: string = 'products',
  compress: boolean = true
): Promise<UploadResult> {
  try {
    console.log('Starting upload process...', { fileName: file.name, size: file.size });

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Compress image if requested
    let fileToUpload = file;
    if (compress) {
      console.log('Compressing image before upload...');
      fileToUpload = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        outputFormat: 'image/jpeg'
      });
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name);
    const storagePath = `${folder}/${fileName}`;

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Set metadata
    const metadata: UploadMetadata = {
      contentType: fileToUpload.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      },
      cacheControl: 'public,max-age=31536000'
    };

    // Upload file with progress logging
    console.log('Uploading to Firebase Storage:', storagePath);
    console.log('File details:', {
      name: fileToUpload.name,
      size: `${Math.round(fileToUpload.size / 1024)}KB`,
      type: fileToUpload.type
    });
    
    const snapshot = await uploadBytes(storageRef, fileToUpload, metadata);
    console.log('Upload complete! Snapshot received:', {
      fullPath: snapshot.ref.fullPath,
      bucket: snapshot.ref.bucket,
      name: snapshot.ref.name
    });
    console.log('Getting download URL...');

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL retrieved successfully!');

    console.log('Upload successful:', {
      path: storagePath,
      url: downloadURL,
      size: `${Math.round(snapshot.metadata.size / 1024)}KB`
    });

    return {
      url: downloadURL,
      path: storagePath,
      size: snapshot.metadata.size
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('storage/unauthorized')) {
        throw new Error('You need to be signed in to upload images. Please log in and try again.');
      } else if (error.message.includes('storage/retry-limit-exceeded')) {
        throw new Error('Upload failed: Firebase Storage may not be properly configured. Please check the Firebase Console.');
      } else if (error.message.includes('storage/canceled')) {
        throw new Error('Upload was cancelled. Please try again.');
      } else if (error.message.includes('storage/unknown')) {
        throw new Error('Upload failed due to a network error. Please check your internet connection and try again.');
      }
    }
    
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads multiple images in parallel
 * @param files - Array of image files to upload
 * @param folder - Storage folder path
 * @param compress - Whether to compress images before upload
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'products',
  compress: boolean = true
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder, compress));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Deletes an image from Firebase Storage
 * @param path - Storage path of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('Image deleted:', path);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes multiple images from Firebase Storage
 * @param paths - Array of storage paths to delete
 * @returns Promise that resolves when all deletions are complete
 */
export async function deleteMultipleImages(paths: string[]): Promise<void> {
  try {
    const deletePromises = paths.map(path => deleteImage(path));
    await Promise.all(deletePromises);
    console.log('Multiple images deleted:', paths.length);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw error;
  }
}

/**
 * Extracts the storage path from a Firebase Storage URL
 * @param url - Firebase Storage download URL
 * @returns Storage path or null if invalid URL
 */
export function getPathFromUrl(url: string): string | null {
  try {
    // Firebase Storage URLs have format:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const match = url.match(/\/o\/(.+?)\?/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}

/**
 * Lists all images in a folder
 * @param folder - Storage folder path
 * @returns Promise with array of storage references
 */
export async function listImages(folder: string = 'products'): Promise<StorageReference[]> {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    return result.items;
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
}

/**
 * Gets download URL for an existing image
 * @param path - Storage path of the image
 * @returns Promise with download URL
 */
export async function getImageUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
}

/**
 * Replaces an existing image with a new one
 * @param oldPath - Storage path of the image to replace
 * @param newFile - New image file
 * @param folder - Storage folder path
 * @returns Promise with upload result
 */
export async function replaceImage(
  oldPath: string,
  newFile: File,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    // Upload new image first
    const uploadResult = await uploadImage(newFile, folder);
    
    // Delete old image
    try {
      await deleteImage(oldPath);
    } catch (error) {
      console.warn('Failed to delete old image:', error);
      // Don't throw - new image is already uploaded
    }
    
    return uploadResult;
  } catch (error) {
    console.error('Error replacing image:', error);
    throw error;
  }
}

/**
 * Checks if a Firebase Storage URL is valid
 * @param url - URL to validate
 * @returns Boolean indicating if URL is valid Firebase Storage URL
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com');
}
