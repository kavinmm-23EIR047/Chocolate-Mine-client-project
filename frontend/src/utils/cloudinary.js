const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

export const IMAGE_WIDTHS = Object.freeze({
  hero: 1600,
  productDetails: 900,
  productCard: 400,
  category: 300,
  thumbnail: 200,
});

const isCloudinaryUrl = (value) => {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.hostname.endsWith('cloudinary.com') && url.pathname.includes(CLOUDINARY_UPLOAD_SEGMENT)
      : false;
  } catch {
    return false;
  }
};

/**
 * Builds a delivery URL for an existing Cloudinary asset. This only changes
 * the requested representation; it never changes the stored asset or URL.
 */
export const getOptimizedCloudinaryUrl = (source, width) => {
  if (!isCloudinaryUrl(source) || !width) return source;

  const url = new URL(source);
  const [prefix, ...rest] = url.pathname.split(CLOUDINARY_UPLOAD_SEGMENT);
  if (!rest.length) return source;

  const assetPath = rest.join(CLOUDINARY_UPLOAD_SEGMENT);
  const segments = assetPath.split('/');
  const firstSegment = segments[0] || '';
  const hasVersion = /^v\d+$/.test(firstSegment);
  const hasTransformations = !hasVersion && firstSegment.includes('_');

  if (hasTransformations) {
    segments.shift();
  }

  const transformation = `c_limit,w_${Math.round(width)}/f_auto/q_auto`;
  url.pathname = `${prefix}${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/${hasTransformations ? `${firstSegment}/` : ''}${segments.join('/')}`;
  return url.toString();
};

export const getImageUrl = (source, width) => getOptimizedCloudinaryUrl(source, width);

