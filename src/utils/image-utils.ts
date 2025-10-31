/**
 * Utility functions for handling product images
 */

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim();
  if (trimmedUrl === '') return false;
  
  // Check for valid URL patterns
  const validPatterns = [
    /^https?:\/\/.+/i, // HTTP/HTTPS URLs
    /^\/[^/].*/, // Relative URLs starting with /
    /^data:image\/.+/i, // Data URLs
  ];
  
  return validPatterns.some(pattern => pattern.test(trimmedUrl));
};

/**
 * Cleans and validates an array of image URLs
 */
export const cleanImageUrls = (images: any[]): string[] => {
  if (!Array.isArray(images)) return [];
  
  return images
    .filter(img => isValidImageUrl(img))
    .map(img => img.trim())
    .filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates
};

/**
 * Gets the best available image from a product's image array
 */
export const getBestImage = (images: string[], fallback: string = '/1G5A2160.jpg'): string => {
  if (!Array.isArray(images) || images.length === 0) {
    return fallback;
  }
  
  const cleanImages = cleanImageUrls(images);
  return cleanImages.length > 0 ? cleanImages[0] : fallback;
};

/**
 * Preloads an image and returns a promise
 */
export const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

/**
 * Preloads multiple images
 */
export const preloadImages = async (urls: string[]): Promise<string[]> => {
  const cleanUrls = cleanImageUrls(urls);
  const promises = cleanUrls.map(url => 
    preloadImage(url).catch(() => null)
  );
  
  const results = await Promise.all(promises);
  return results.filter(Boolean) as string[];
};

/**
 * Gets optimal image dimensions for different display contexts
 */
export const getOptimalImageSize = (context: 'thumbnail' | 'card' | 'detail' | 'fullscreen') => {
  const sizes = {
    thumbnail: { width: 100, height: 100 },
    card: { width: 300, height: 300 },
    detail: { width: 600, height: 600 },
    fullscreen: { width: 1200, height: 1200 }
  };
  
  return sizes[context];
};

/**
 * Creates a placeholder image URL with dimensions
 */
export const createPlaceholderUrl = (width: number = 300, height: number = 300, text: string = 'No Image'): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">${text}</text>
    </svg>
  `)}`;
};