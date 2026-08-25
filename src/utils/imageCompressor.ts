/**
 * Utility to compress and downscale Base64 / Data URL images using HTML5 Canvas.
 * Reduces raw mobile photos (5-12MB) down to compressed JPEGs (~40-80KB)
 * to prevent browser storage quota errors (QuotaExceededError).
 */

export const compressImage = (
  imageStr: string,
  maxDimension: number = 1000,
  quality: number = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    // If empty or already a remote HTTP/HTTPS URL, return as is
    if (!imageStr || imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
      return resolve(imageStr);
    }

    // Must be a data URL or blob URL to process
    if (!imageStr.startsWith('data:') && !imageStr.startsWith('blob:')) {
      return resolve(imageStr);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scaled dimensions keeping aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(imageStr);
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      console.warn('Image compression fallback - could not load image:', err);
      resolve(imageStr);
    };

    img.src = imageStr;
  });
};

/**
 * Compress an array of image URLs/Base64 strings in parallel.
 */
export const compressImagesList = async (
  images: string[],
  maxDimension: number = 1000,
  quality: number = 0.75
): Promise<string[]> => {
  if (!Array.isArray(images) || images.length === 0) return [];
  return Promise.all(images.map(img => compressImage(img, maxDimension, quality)));
};
