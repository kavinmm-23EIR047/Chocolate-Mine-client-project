import imageCompression from 'browser-image-compression';

// Keep the uploaded master large enough for product detail views and future
// crops. Cloudinary creates the smaller delivery versions on demand.
export const MAX_IMAGE_DIMENSION = 2600;
// Stay below the backend's 2 MB upload limit while preserving more detail.
export const MAX_OPTIMIZED_BYTES = 1.9 * 1024 * 1024;
export const TARGET_OPTIMIZED_BYTES = 1.5 * 1024 * 1024;

const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const loadImage = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('The selected file is not a readable image.'));
  };
  image.src = objectUrl;
});

export const getImageDimensions = async (file) => {
  const image = await loadImage(file);
  return { width: image.naturalWidth, height: image.naturalHeight };
};

const hasTransparency = async (file, dimensions) => {
  if (file.type !== 'image/png') return false;

  const image = await loadImage(file);
  const scale = Math.min(1, 256 / Math.max(dimensions.width, dimensions.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(dimensions.width * scale));
  canvas.height = Math.max(1, Math.round(dimensions.height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] < 255) return true;
  }
  return false;
};

const optimize = (file, fileType, quality, maxSizeMB) => imageCompression(file, {
  maxSizeMB,
  maxWidthOrHeight: MAX_IMAGE_DIMENSION,
  useWebWorker: true,
  initialQuality: quality,
  fileType,
  alwaysKeepResolution: false,
});

/**
 * Compress a locally selected product image before it reaches the API.
 * The original is retained only when it already meets the storage rules.
 */
export const compressImage = async (file) => {
  if (!(file instanceof File)) throw new Error('Please select an image file.');
  if (!SUPPORTED_TYPES.has(file.type)) {
    throw new Error('Unsupported image format. Please use JPG, PNG, or WebP.');
  }

  const dimensions = await getImageDimensions(file);
  if (!dimensions.width || !dimensions.height) throw new Error('The image has invalid dimensions.');

  const preserveTransparency = await hasTransparency(file, dimensions);
  const alreadyOptimized = file.size <= TARGET_OPTIMIZED_BYTES &&
    file.type === 'image/webp' &&
    dimensions.width <= MAX_IMAGE_DIMENSION &&
    dimensions.height <= MAX_IMAGE_DIMENSION;

  if (alreadyOptimized) return file;

  const outputType = preserveTransparency ? 'image/png' : 'image/webp';
  let compressed = await optimize(file, outputType, 0.94, 1.9);
  if (compressed.size > MAX_OPTIMIZED_BYTES) {
    compressed = await optimize(file, outputType, 0.89, 1.9);
  }

  if (compressed.size > MAX_OPTIMIZED_BYTES) {
    throw new Error('This image is larger than 1.9 MB after quality optimization. Please choose a smaller source image.');
  }

  const extension = outputType === 'image/png' ? 'png' : 'webp';
  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'product-image';
  return new File([compressed], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
};

export default compressImage;
