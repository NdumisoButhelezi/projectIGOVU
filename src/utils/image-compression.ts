/**
 * Image compression and optimization utilities
 * Processes images before uploading to Firebase Storage
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  outputFormat: 'image/jpeg'
};

/**
 * Compresses an image file to optimize for web storage
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to compressed File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxWidth = opts.maxWidth!;
        const maxHeight = opts.maxHeight!;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file from blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${opts.outputFormat!.split('/')[1]}`),
              {
                type: opts.outputFormat!,
                lastModified: Date.now()
              }
            );

            console.log('Image compression:', {
              original: `${Math.round(file.size / 1024)}KB`,
              compressed: `${Math.round(compressedFile.size / 1024)}KB`,
              reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`,
              dimensions: `${width}x${height}`
            });

            resolve(compressedFile);
          },
          opts.outputFormat!,
          opts.quality!
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates image file before processing
 * @param file - The file to validate
 * @param maxSize - Maximum file size in bytes (default 10MB)
 * @returns Object with isValid flag and error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024
): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Image size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }

  // Check for valid image formats
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validFormats.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid image format. Supported: JPEG, PNG, WebP, GIF'
    };
  }

  return { isValid: true };
}

/**
 * Creates multiple sizes of an image (thumbnail, medium, large)
 * @param file - Original image file
 * @returns Promise resolving to object with different sized images
 */
export async function createImageVariants(file: File): Promise<{
  thumbnail: File;
  medium: File;
  large: File;
}> {
  const [thumbnail, medium, large] = await Promise.all([
    compressImage(file, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.8,
      outputFormat: 'image/jpeg'
    }),
    compressImage(file, {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.85,
      outputFormat: 'image/jpeg'
    }),
    compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.9,
      outputFormat: 'image/jpeg'
    })
  ]);

  return { thumbnail, medium, large };
}
