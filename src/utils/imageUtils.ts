
/**
 * Utility functions for handling images
 */

/**
 * Convert File to base64 string
 * @param file The file to convert
 * @returns Promise with base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert and optimize image to JPEG base64
 * @param file The image file
 * @param maxWidth Maximum width for the image
 * @returns Promise with optimized base64 JPEG string
 */
export const optimizeImageToBase64 = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and convert to JPEG
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      // Convert to JPEG with quality 0.8
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(base64);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
