/**
 * Alternative Firebase Storage upload with progress tracking
 * Use this if regular upload is hanging
 */

import { ref, uploadBytesResumable, getDownloadURL, UploadMetadata } from 'firebase/storage';
import { storage } from '../config/firebase';
import { compressImage, validateImageFile } from '../utils/image-compression';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  return `${sanitizedName}_${timestamp}_${randomString}.${extension}`;
}

export async function uploadImageWithProgress(
  file: File,
  folder: string = 'Images',
  compress: boolean = true,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string; size: number }> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[PROGRESSIVE UPLOAD] Starting upload process...');
      console.log('[PROGRESSIVE UPLOAD] Environment:', window.location.hostname);
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Compress image if requested
      let fileToUpload = file;
      if (compress) {
        console.log('[PROGRESSIVE UPLOAD] Compressing image...');
        fileToUpload = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          outputFormat: 'image/jpeg'
        });
        console.log('[PROGRESSIVE UPLOAD] Compression complete');
      }

      // Generate unique filename
      const fileName = generateUniqueFileName(file.name);
      const storagePath = `${folder}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Set metadata with CORS-friendly settings
      const metadata: UploadMetadata = {
        contentType: fileToUpload.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        },
        cacheControl: 'public,max-age=31536000'
      };

      console.log('[PROGRESSIVE UPLOAD] Starting upload to:', storagePath);
      console.log('[PROGRESSIVE UPLOAD] File size:', fileToUpload.size, 'bytes');
      console.log('[PROGRESSIVE UPLOAD] Storage bucket:', storage.app.options.storageBucket);

      // Create upload task with longer timeout for development
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const timeoutDuration = isDevelopment ? 180000 : 120000; // 3 mins for dev, 2 mins for prod
      
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, metadata);

      // Add timeout
      const timeoutId = setTimeout(() => {
        console.error(`[PROGRESSIVE UPLOAD] Upload timeout after ${timeoutDuration / 1000} seconds`);
        console.warn('[PROGRESSIVE UPLOAD] Note: CORS issues in development are normal. This will work when deployed.');
        uploadTask.cancel();
        reject(new Error(`Upload timeout. ${isDevelopment ? 'CORS issues in development are normal - this will work when deployed to production.' : 'Please check your internet connection.'}`));
      }, timeoutDuration);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          };
          
          console.log(`[PROGRESSIVE UPLOAD] Progress: ${progress.percentage}% (${progress.bytesTransferred}/${progress.totalBytes} bytes) - State: ${snapshot.state}`);
          
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('[PROGRESSIVE UPLOAD] Upload error:', error);
          console.error('[PROGRESSIVE UPLOAD] Error code:', error.code);
          console.error('[PROGRESSIVE UPLOAD] Error message:', error.message);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          clearTimeout(timeoutId);
          console.log('[PROGRESSIVE UPLOAD] Upload complete! Getting download URL...');
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[PROGRESSIVE UPLOAD] Success!', {
              path: storagePath,
              url: downloadURL,
              size: uploadTask.snapshot.metadata.size
            });
            
            resolve({
              url: downloadURL,
              path: storagePath,
              size: uploadTask.snapshot.metadata.size || 0
            });
          } catch (urlError) {
            console.error('[PROGRESSIVE UPLOAD] Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );

    } catch (error) {
      console.error('[PROGRESSIVE UPLOAD] Error:', error);
      reject(error);
    }
  });
}
