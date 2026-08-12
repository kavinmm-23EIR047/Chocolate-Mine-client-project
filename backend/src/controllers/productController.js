const mongoose = require('mongoose');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('slugify');
const cloudinaryService = require('../services/cloudinaryService');
const notificationManager = require('../services/notificationManager');

const DEFAULT_CAKE_IMAGE_URL = 'https://via.placeholder.com/800x600.png?text=Chocolate+Mine+Cake+Background';

const normalizeFlavorImageUrls = async (flavors, folder = 'products/flavors') => {
  if (!Array.isArray(flavors)) return flavors;

  return Promise.all(flavors.map(async (flavor) => {
    if (!Array.isArray(flavor?.images)) return flavor;

    const images = await Promise.all(flavor.images.map(async (image) => {
      if (typeof image !== 'string' || !image.startsWith('data:image/')) return image;
      const uploaded = await cloudinaryService.uploadImage(image, folder);
      return uploaded?.secure_url || image;
    }));

    return { ...flavor, images };
  }));
};

const productListFields = (product) => {
  const productObj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  delete productObj.gallery;

  if (Array.isArray(productObj.flavors)) {
    productObj.flavors = productObj.flavors.map(({ images, ...flavor }) => flavor);
  }

  return productObj;
};

// Helper function to safely normalize boolean values from FormData
const normalizeBoolean = (value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  // Handle array case (if multiple values were sent)
  if (Array.isArray(value)) {
    return value[0] === 'true' || value[0] === true;
  }
  return false; // default value
};

const toSentenceCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const validateProductFile = (file) => {
  if (!file) return;
  const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!supportedTypes.has(file.mimetype)) {
    throw new AppError('Unsupported image format. Please upload JPG, PNG, or WebP.', 400);
  }
  if (!Buffer.isBuffer(file.buffer) || file.size > 2 * 1024 * 1024) {
    throw new AppError('Image must be smaller than 2 MB.', 400);
  }
};

const applyCoupon = (product) => {
  if (!product.coupon || !product.coupon.enabled) return null;
  const now = new Date();
  const { startDate, endDate, usageLimit, usedCount, type, value, code } = product.coupon;

  // Check date range
  if (startDate && now < new Date(startDate)) return null;
  if (endDate && now > new Date(endDate)) return null;

  // Check usage limit
  if (usageLimit && usedCount >= usageLimit) return null;

  let finalPrice = product.price;
  let saved = 0;
  if (type === 'flat') {
    finalPrice = Math.max(0, product.price - value);
    saved = value;
  } else if (type === 'price') {
    finalPrice = value;
    saved = product.price - value;
  } else if (type === 'percent') {
    saved = (product.price * value) / 100;
    finalPrice = Math.max(0, product.price - saved);
  }
  return { code, finalPrice, saved, discountText: type === 'percent' ? `${value}% OFF` : `Save ₹${saved}` };
};

function getBaseFilterPattern(term) {
  if (!term) return '';
  const lower = term.toLowerCase().trim();
  return lower.replace(/[\s_-]+/g, '[\\s_-]*');
}

exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort,
    featured,
    bestseller,
    offers,
    category,
    subCategory,
    cakeType,
    location,
    occasion,
    rating,
    minPrice,
    maxPrice,
    q,
    admin
  } = req.query;

  let query = admin === 'true' ? {} : { isActive: true };

  if (featured) query.featured = featured === 'true';
  if (bestseller) query.bestseller = bestseller === 'true';
  if (offers === 'true') {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { offerPrice: { $gt: 0 } },
        { 'coupon.enabled': true }
      ]
    });
  }
  if (category) {
    const categoriesList = category.split(',').map(c => c.trim()).filter(Boolean);
    const regexPattern = categoriesList.map(c => getBaseFilterPattern(c)).join('|');
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { category: { $regex: regexPattern, $options: 'i' } },
        { subCategory: { $regex: regexPattern, $options: 'i' } },
        { occasion: { $regex: regexPattern, $options: 'i' } }
      ]
    });
  }
  if (subCategory) {
    const subCatLower = subCategory.toLowerCase();
    const regexPattern = subCatLower.replace(/[\s_-]+/g, '[\\s_-]*');

    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { subCategory: { $regex: regexPattern, $options: 'i' } },
        { cakeType: { $regex: regexPattern, $options: 'i' } },
        { 'variants.flavor': { $regex: regexPattern, $options: 'i' } }
      ]
    });
  }
  if (cakeType) query.cakeType = cakeType;
  if (location) {
    const locLower = location.toLowerCase().trim();
    if (locLower !== 'all' && locLower !== 'pan india' && locLower !== 'pan-india') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { location: { $regex: getBaseFilterPattern(locLower), $options: 'i' } },
          { location: 'all' },
          { location: 'pan india' },
          { location: 'pan-india' }
        ]
      });
    }
  }

  if (occasion) {
    const regexPattern = getBaseFilterPattern(occasion);
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { occasion: { $regex: regexPattern, $options: 'i' } },
        { category: { $regex: regexPattern, $options: 'i' } }
      ]
    });
  }

  // Filter by rating
  if (rating) {
    query.ratingsAverage = { $gte: parseFloat(rating) };
  }

  // Filter by price
  if (minPrice || maxPrice) {
    const priceCond = {};
    if (minPrice) priceCond.$gte = parseFloat(minPrice);
    if (maxPrice) priceCond.$lte = parseFloat(maxPrice);

    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { price: priceCond },
        { 'variants.price': priceCond }
      ]
    });
  }

  const searchParam = (req.query.search || req.query.q || req.query.query || '').trim();

  // Integrated MongoDB Atlas Search
  if (searchParam && searchParam.length >= 2) {
    const { results: rawAtlasProducts, total: atlasTotal } = await executeProductAtlasSearch(searchParam, query, { page, limit, sort });

    const BENTO_FLAVOR_PRICES = {
      'White Forest': 380,
      'Butterscotch': 390,
      'Rose Milk': 410,
      'Honey & Almond': 410,
      'Black Forest': 380,
      'Choco Fudge': 390,
      'Choco Truffle': 410,
      'Choco Oreo': 410,
      'Choco Caramel': 420,
      'Death by Chocolate': 450,
      'Red Velvet': 470,
      'Lotus Biscoff': 480,
      'Choco Pistachio': 480,
    };

    const getFlavorPriceHelper = (flavor) => {
      if (!flavor) return 0;
      if (flavor.price && Number(flavor.price) > 0) return Number(flavor.price);
      if (flavor.name && BENTO_FLAVOR_PRICES[flavor.name]) return BENTO_FLAVOR_PRICES[flavor.name];
      return 0;
    };

    const products = rawAtlasProducts.map(p => {
      const couponData = applyCoupon(p);
      const isBento = Array.isArray(p.category) ? p.category.some(c => typeof c === 'string' && c.toLowerCase().includes('bento')) : (p.category || '').toLowerCase().includes('bento');

      let defaultFlavorPrice = 0;
      if (!(p.hasVariants && p.variants && p.variants.length > 0) && p.flavors && Array.isArray(p.flavors) && p.flavors.length > 0) {
        defaultFlavorPrice = getFlavorPriceHelper(p.flavors[0]);
      }

      let baseP = Number(p.price || 0);
      if (baseP === 0 && (p.hasCustomWeights || (Array.isArray(p.customWeightPrices) && p.customWeightPrices.length > 0)) && p.customWeightPrices?.[0]?.price !== undefined) {
        baseP = Number(p.customWeightPrices[0].price);
      }

      let sellingPrice;
      if (p.hasVariants && p.variants && p.variants.length > 0) {
        sellingPrice = p.variants[0].price;
      } else {
        sellingPrice = ((p.offerPrice && p.offerPrice > 0 && p.offerPrice < baseP) ? p.offerPrice : baseP) + defaultFlavorPrice;
      }

      return {
        ...productListFields(p),
        couponAvailable: !!couponData,
        finalPrice: sellingPrice,
        discountText: couponData ? couponData.discountText : null,
        activeCouponCode: couponData ? couponData.code : null,
        priceWithCoupon: couponData ? couponData.finalPrice : sellingPrice
      };
    });

    return res.status(200).json({ status: 'success', total: atlasTotal, data: products });
  }

  let sortQuery = '-createdAt _id';
  if (sort === 'price-low') sortQuery = 'price _id';
  if (sort === 'price-high') sortQuery = '-price _id';
  if (sort === 'rating') sortQuery = '-ratingsAverage _id';
  if (sort === 'newest') sortQuery = '-createdAt _id';

  const rawProducts = await Product.find(query)
    .sort(sortQuery)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const BENTO_FLAVOR_PRICES = {
    'White Forest': 380,
    'Butterscotch': 390,
    'Rose Milk': 410,
    'Honey & Almond': 410,
    'Black Forest': 380,
    'Choco Fudge': 390,
    'Choco Truffle': 410,
    'Choco Oreo': 410,
    'Choco Caramel': 420,
    'Death by Chocolate': 450,
    'Red Velvet': 470,
    'Lotus Biscoff': 480,
    'Choco Pistachio': 480,
  };

  const getFlavorPriceHelper = (flavor) => {
    if (!flavor) return 0;
    if (flavor.price && Number(flavor.price) > 0) return Number(flavor.price);
    if (flavor.name && BENTO_FLAVOR_PRICES[flavor.name]) return BENTO_FLAVOR_PRICES[flavor.name];
    return 0;
  };

  const products = rawProducts.map(p => {
    const couponData = applyCoupon(p);
    const productObj = productListFields(p);

    const isBento = Array.isArray(p.category) ? p.category.some(c => typeof c === 'string' && c.toLowerCase().includes('bento')) : (p.category || '').toLowerCase().includes('bento');

    let defaultFlavorPrice = 0;
    if (!(p.hasVariants && p.variants && p.variants.length > 0) && p.flavors && Array.isArray(p.flavors) && p.flavors.length > 0) {
      defaultFlavorPrice = getFlavorPriceHelper(p.flavors[0]);
    }

    let baseP = Number(p.price || 0);
    if (baseP === 0 && (p.hasCustomWeights || (Array.isArray(p.customWeightPrices) && p.customWeightPrices.length > 0)) && p.customWeightPrices?.[0]?.price !== undefined) {
      baseP = Number(p.customWeightPrices[0].price);
    }

    let sellingPrice;
    if (p.hasVariants && p.variants && p.variants.length > 0) {
      sellingPrice = p.variants[0].price;
    } else {
      sellingPrice = ((p.offerPrice && p.offerPrice > 0 && p.offerPrice < baseP) ? p.offerPrice : baseP) + defaultFlavorPrice;
    }

    return {
      ...productObj,
      couponAvailable: !!couponData,
      finalPrice: sellingPrice,
      discountText: couponData ? couponData.discountText : null,
      activeCouponCode: couponData ? couponData.code : null,
      priceWithCoupon: couponData ? couponData.finalPrice : sellingPrice
    };
  });

  const total = await Product.countDocuments(query);
  res.status(200).json({ status: 'success', total, data: products });
});

exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { productId, code } = req.body;

  if (!productId || !code) {
    return next(new AppError('Product ID and coupon code are required', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if coupon exists and is enabled
  if (!product.coupon || !product.coupon.enabled) {
    return next(new AppError('No active coupon available for this product', 400));
  }

  // Case-insensitive code comparison
  const normalizedInputCode = code.trim().toUpperCase();
  const normalizedCouponCode = product.coupon.code.trim().toUpperCase();

  if (normalizedCouponCode !== normalizedInputCode) {
    return next(new AppError('Invalid coupon code', 400));
  }

  const now = new Date();

  // Check start date
  if (product.coupon.startDate) {
    const startDate = new Date(product.coupon.startDate);
    if (now < startDate) {
      return next(new AppError(`Coupon is not valid until ${startDate.toLocaleDateString()}`, 400));
    }
  }

  // Check end date
  if (product.coupon.endDate) {
    const endDate = new Date(product.coupon.endDate);
    if (now > endDate) {
      return next(new AppError(`Coupon expired on ${endDate.toLocaleDateString()}`, 400));
    }
  }

  // Check usage limit
  if (product.coupon.usageLimit) {
    const usedCount = product.coupon.usedCount || 0;
    if (usedCount >= product.coupon.usageLimit) {
      return next(new AppError('Coupon usage limit has been reached', 400));
    }
  }

  // Calculate discount using applyCoupon
  const couponData = applyCoupon(product);
  if (!couponData) {
    return next(new AppError('Invalid or expired coupon code', 400));
  }

  // Determine selling price (consider variants and offer price)
  let sellingPrice;
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    sellingPrice = product.variants[0].price;
  } else {
    sellingPrice = (product.offerPrice && product.offerPrice < product.price) ? product.offerPrice : product.price;
  }

  // Recalculate final price based on selling price
  let finalPrice = sellingPrice;
  let saved = 0;
  let discountText = '';

  if (product.coupon.type === 'flat') {
    saved = product.coupon.value;
    finalPrice = Math.max(0, sellingPrice - saved);
    discountText = `Save ₹${saved}`;
  } else if (product.coupon.type === 'percent') {
    saved = (sellingPrice * product.coupon.value) / 100;
    finalPrice = Math.max(0, sellingPrice - saved);
    discountText = `${product.coupon.value}% OFF`;
  } else if (product.coupon.type === 'price') {
    finalPrice = product.coupon.value;
    saved = sellingPrice - finalPrice;
    discountText = `Special price: ₹${finalPrice}`;
  }

  res.status(200).json({
    status: 'success',
    data: {
      valid: true,
      code: product.coupon.code,
      originalPrice: sellingPrice,
      finalPrice: Math.round(finalPrice),
      saved: Math.round(saved),
      discountText,
      type: product.coupon.type,
      value: product.coupon.value
    }
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  if (!slug) return next(new AppError('Product identifier missing', 400));

  let product;

  // 1. Try by ObjectId if valid 24-hex string
  if (slug.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      product = await Product.findById(slug);
    } catch (err) {
      console.error('FindById error:', err);
    }
  }

  // 2. Try by exact slug
  if (!product) {
    product = await Product.findOne({ slug: slug });
  }

  // 3. Try by case-insensitive slug regex
  if (!product) {
    try {
      const cleanSlug = slug.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      product = await Product.findOne({ slug: new RegExp(`^${cleanSlug}$`, 'i') });
    } catch (err) {
      console.error('RegExp slug search error:', err);
    }
  }

  if (!product) return next(new AppError('Product not found', 404));

  let couponData = null;
  try {
    couponData = applyCoupon(product);
  } catch (err) {
    console.error('Coupon calculation error:', err);
  }

  let sellingPrice;
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    sellingPrice = product.variants[0].price;
  } else {
    sellingPrice = (product.offerPrice && product.offerPrice < product.price) ? product.offerPrice : product.price;
  }

  const Category = require('../models/Category');
  let allowCakeMessage = false;
  try {
    const categoriesToCheck = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);
    const catQuery = [];
    if (product.categoryId) catQuery.push({ _id: product.categoryId });
    if (categoriesToCheck.length > 0) {
      catQuery.push({ name: { $in: categoriesToCheck.map(c => typeof c === 'string' ? c.trim().toLowerCase() : String(c).trim().toLowerCase()) } });
    }
    if (catQuery.length > 0) {
      const matchedCat = await Category.findOne({ $or: catQuery, allowCakeMessage: true }).lean();
      if (matchedCat) allowCakeMessage = true;
    }
  } catch (err) {
    console.error('Error resolving category allowCakeMessage:', err);
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...product.toObject(),
      allowCakeMessage,
      couponAvailable: !!couponData,
      finalPrice: sellingPrice,
      discountText: couponData ? couponData.discountText : null,
      priceWithCoupon: couponData ? couponData.finalPrice : sellingPrice
    }
  });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const body = { ...req.body };
  if (body.name) body.name = toSentenceCase(body.name);

  // Normalize Boolean fields
  body.hasVariants = normalizeBoolean(body.hasVariants);
  body.hasWeights = normalizeBoolean(body.hasWeights);
  body.hasCustomWeights = normalizeBoolean(body.hasCustomWeights);
  body.allowCustomFlavor = normalizeBoolean(body.allowCustomFlavor);
  body.allowCustomWeight = normalizeBoolean(body.allowCustomWeight);

  // Parse categories if stringified
  if (body.category) {
    if (typeof body.category === 'string') {
      try {
        const parsed = JSON.parse(body.category);
        body.category = Array.isArray(parsed) ? parsed.map(c => c.trim().toLowerCase()) : [parsed.trim().toLowerCase()];
      } catch (e) {
        body.category = body.category.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      }
    } else if (Array.isArray(body.category)) {
      body.category = body.category.map(c => c.toString().trim().toLowerCase());
    }
  }

  if (body.subCategory) body.subCategory = body.subCategory.trim().toLowerCase();

  // Parse JSON fields
  const jsonFields = ['flavors', 'weights', 'variants', 'customWeightPrices', 'occasion'];
  jsonFields.forEach(field => {
    if (body[field] && typeof body[field] === 'string') {
      try {
        body[field] = JSON.parse(body[field]);
      } catch (e) { }
    }
  });

  const isCakes = Array.isArray(body.category) ? body.category.some(c => c.includes('cake') || c.includes('bento')) : (body.category || '').includes('cake');

  if (isCakes && body.flavors) {
    body.flavors = await normalizeFlavorImageUrls(
      body.flavors,
      `products/${slugify(body.name || 'product', { lower: true })}/flavors`
    );
  }

  if (body.customWeightPrices && typeof body.customWeightPrices === 'string') {
    try {
      body.customWeightPrices = JSON.parse(body.customWeightPrices);
    } catch (e) { }
  }

  // Handle nested coupon object
  if (body['coupon.enabled'] !== undefined) {
    const isEnabled = body['coupon.enabled'] === 'true' || body['coupon.enabled'] === true;

    if (!isEnabled) {
      body.coupon = { enabled: false };
    } else {
      body.coupon = {
        enabled: true,
        code: body['coupon.code']?.trim(),
        type: body['coupon.type']?.trim() || 'percent',
        value: Number(body['coupon.value']) || 0,
        startDate: body['coupon.startDate'] || null,
        endDate: body['coupon.endDate'] || null,
        usageLimit: body['coupon.usageLimit'] ? Number(body['coupon.usageLimit']) : null,
        usedCount: 0
      };
    }

    Object.keys(body).forEach(key => {
      if (key.startsWith('coupon.')) delete body[key];
    });
  }

  validateProductFile(req.file);
  let uploadedImage = null;
  let imageInput = body.image;

  if (!imageInput && isCakes) {
    imageInput = DEFAULT_CAKE_IMAGE_URL;
  }

  if (req.file) {
    try {
      uploadedImage = await cloudinaryService.uploadBuffer(req.file.buffer, 'products', req.file.mimetype);
    } catch (error) {
      return next(new AppError('Image upload failed. Product was not created.', 502));
    }
    if (!uploadedImage) return next(new AppError('Image upload failed. Product was not created.', 502));
    body.image = uploadedImage.secure_url;
    body.imagePublicId = uploadedImage.public_id;
  } else if (!body.image && isCakes) {
    body.image = DEFAULT_CAKE_IMAGE_URL;
  }

  let baseSlug = slugify(body.name, { lower: true });
  let slugStr = baseSlug;
  let slugCounter = 1;
  while (await Product.findOne({ slug: slugStr })) {
    slugStr = `${baseSlug}-${slugCounter}`;
    slugCounter++;
  }
  body.slug = slugStr;
  body.createdBy = req.user._id;

  let product;
  try {
    product = await Product.create(body);
  } catch (error) {
    if (uploadedImage?.public_id) await cloudinaryService.deleteImage(uploadedImage.public_id);
    throw error;
  }

  // Trigger Push Notification asynchronously
  notificationManager.notifyNewProduct(product).catch(console.error);

  if (product.coupon && product.coupon.enabled) {
    notificationManager.notifyCouponAdded(product).catch(console.error);
  }

  res.status(201).json({ status: 'success', data: product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  // Capture old values for meaningful notification comparison
  const oldStock = product.stock;
  const oldOfferPrice = product.offerPrice;
  const oldPrice = product.price;

  const oldCouponCode = product.coupon?.code;
  const oldCouponEnabled = product.coupon?.enabled;

  const body = { ...req.body };
  if (body.name) body.name = toSentenceCase(body.name);

  // FIX: Normalize boolean fields first (critical for CastError fix)
  const hasVariants = normalizeBoolean(body.hasVariants);
  const hasWeights = normalizeBoolean(body.hasWeights);
  const hasCustomWeights = normalizeBoolean(body.hasCustomWeights);
  const allowCustomFlavor = normalizeBoolean(body.allowCustomFlavor);
  const allowCustomWeight = normalizeBoolean(body.allowCustomWeight);
  if (body.hasWeights !== undefined) product.hasWeights = hasWeights;
  if (body.hasCustomWeights !== undefined) product.hasCustomWeights = hasCustomWeights;

  // FIX: Normalize category to lowercase and trim (for dynamic category support)
  if (body.category !== undefined) {
    if (Array.isArray(body.category)) {
      body.category = body.category.map(c => typeof c === 'string' ? c.trim().toLowerCase() : c);
    } else if (typeof body.category === 'string') {
      try {
        const parsed = JSON.parse(body.category);
        body.category = Array.isArray(parsed) ? parsed.map(c => typeof c === 'string' ? c.trim().toLowerCase() : c) : [parsed.trim().toLowerCase()];
      } catch (e) {
        body.category = body.category.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      }
    }
  }
  if (body.subCategory) {
    body.subCategory = body.subCategory.trim().toLowerCase();
  }

  Object.keys(body).forEach(key => {
    if (typeof body[key] === 'string') {
      const trimmed = body[key].trim();
      if (trimmed === 'true') {
        body[key] = true;
      } else if (trimmed === 'false') {
        body[key] = false;
      } else if (trimmed !== '' && !isNaN(trimmed) && !['name', 'slug', 'description', 'shortDescription', 'image', 'occasion', 'flavors', 'weights', 'variants', 'category', 'subCategory'].includes(key)) {
        body[key] = Number(trimmed);
      } else {
        body[key] = trimmed;
      }
    }
  });

  // Handle occasion array
  if (body.occasion !== undefined) {
    if (Array.isArray(body.occasion)) {
      product.occasion = body.occasion;
    } else if (typeof body.occasion === 'string') {
      try {
        const parsed = JSON.parse(body.occasion);
        product.occasion = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        product.occasion = body.occasion.split(',').map(o => o.trim()).filter(Boolean);
      }
    }
  }

  // Handle variant data for cakes (with multiple images per flavor)
  const finalCategory = body.category || product.category || [];
  const isCakes = Array.isArray(finalCategory) ? finalCategory.some(c => typeof c === 'string' && (c.includes('cake') || c.includes('bento'))) : false;
  if (isCakes) {
    if (body.flavors !== undefined) {
      if (typeof body.flavors === 'string') {
        try {
          const parsedFlavors = JSON.parse(body.flavors);
          product.flavors = parsedFlavors.map(flavor => ({
            name: flavor.name,
            price: flavor.price || 0,
            images: flavor.images || []
          }));
        } catch (e) { }
      } else {
        product.flavors = body.flavors;
      }
    }
    if (body.weights !== undefined) {
      if (typeof body.weights === 'string') {
        try {
          product.weights = JSON.parse(body.weights);
        } catch (e) { }
      } else {
        product.weights = body.weights;
      }
    }
    if (body.variants !== undefined) {
      if (typeof body.variants === 'string') {
        try {
          product.variants = JSON.parse(body.variants);
        } catch (e) { }
      } else {
        product.variants = body.variants;
      }
    }
    if (product.flavors !== undefined) {
      product.flavors = await normalizeFlavorImageUrls(
        product.flavors,
        `products/${slugify(product.name || 'product', { lower: true })}/flavors`
      );
    }
    // Use normalized boolean values
    if (body.hasVariants !== undefined) product.hasVariants = hasVariants;
    if (body.allowCustomFlavor !== undefined) product.allowCustomFlavor = allowCustomFlavor;
    if (body.allowCustomWeight !== undefined) product.allowCustomWeight = allowCustomWeight;
  } else {
    product.flavors = undefined;
    product.weights = undefined;
    product.variants = undefined;
    product.hasVariants = false;
    product.allowCustomFlavor = false;
    product.allowCustomWeight = false;
  }

  // Always update customWeightPrices and hasCustomWeights for any product category
  if (body.customWeightPrices !== undefined) {
    if (typeof body.customWeightPrices === 'string') {
      try {
        product.customWeightPrices = JSON.parse(body.customWeightPrices);
      } catch (e) { }
    } else {
      product.customWeightPrices = body.customWeightPrices;
    }
  }
  if (body.hasCustomWeights !== undefined) {
    product.hasCustomWeights = hasCustomWeights;
  }

  // Handle nested coupon object
  if (body['coupon.enabled'] !== undefined) {
    const isEnabled = body['coupon.enabled'] === 'true' || body['coupon.enabled'] === true;

    if (!isEnabled) {
      product.coupon = { enabled: false };
    } else {
      product.coupon = {
        enabled: true,
        code: body['coupon.code']?.trim(),
        type: body['coupon.type']?.trim() || 'percent',
        value: Number(body['coupon.value']) || 0,
        startDate: body['coupon.startDate'] || product.coupon?.startDate || null,
        endDate: body['coupon.endDate'] || product.coupon?.endDate || null,
        usageLimit: body['coupon.usageLimit'] ? Number(body['coupon.usageLimit']) : product.coupon?.usageLimit || null,
        usedCount: product.coupon?.usedCount || 0
      };
    }

    Object.keys(body).forEach(key => {
      if (key.startsWith('coupon.')) delete body[key];
    });
  }

  // Handle other fields (including dynamic category)
  const fieldsToUpdate = ['name', 'description', 'shortDescription', 'price', 'offerPrice', 'category', 'subCategory', 'location', 'stock', 'featured', 'bestseller', 'isActive'];
  fieldsToUpdate.forEach(field => {
    if (body[field] !== undefined) {
      product[field] = body[field];
    }
  });

  // Upload the replacement first. The old asset remains available until the
  // database update succeeds, so failed replacements never destroy the old image.
  let uploadedReplacement = null;
  const oldPublicId = product.imagePublicId;
  let removedPublicId = null;
  if (req.file) {
    validateProductFile(req.file);
    try {
      uploadedReplacement = await cloudinaryService.uploadBuffer(req.file.buffer, 'products', req.file.mimetype);
    } catch (error) {
      return next(new AppError('Image upload failed. The existing image was kept.', 502));
    }
    if (!uploadedReplacement) return next(new AppError('Image upload failed. The existing image was kept.', 502));
    product.image = uploadedReplacement.secure_url;
    product.imagePublicId = uploadedReplacement.public_id;
  } else if ((body.removeImage === 'true' || body.removeImage === true) && product.imagePublicId) {
    // Product.image is required by the existing schema, so retain the existing
    // placeholder contract while removing the Cloudinary asset and publicId.
    removedPublicId = product.imagePublicId;
    product.image = DEFAULT_CAKE_IMAGE_URL;
    product.imagePublicId = undefined;
  }

  if (body.name && body.name !== product.name) {
    let baseSlug = slugify(body.name, { lower: true });
    let slugStr = baseSlug;
    let slugCounter = 1;
    while (await Product.findOne({ slug: slugStr, _id: { $ne: product._id } })) {
      slugStr = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }
    product.slug = slugStr;
  }

  try {
    await product.save();
  } catch (error) {
    if (uploadedReplacement?.public_id) await cloudinaryService.deleteImage(uploadedReplacement.public_id);
    throw error;
  }

  if (uploadedReplacement?.public_id && oldPublicId && oldPublicId !== uploadedReplacement.public_id) {
    await cloudinaryService.deleteImage(oldPublicId);
  }
  if (removedPublicId) await cloudinaryService.deleteImage(removedPublicId);

  // Trigger real-time notifications for the update (only meaningful changes)
  const notificationManager = require('../services/notificationManager');
  const previousData = { stock: oldStock, offerPrice: oldOfferPrice, price: oldPrice };
  notificationManager.notifyProductUpdated(product, previousData).catch(console.error);

  if (product.coupon && product.coupon.enabled && (!oldCouponEnabled || oldCouponCode !== product.coupon.code)) {
    notificationManager.notifyCouponAdded(product).catch(console.error);
  }

  res.status(200).json({ status: 'success', data: product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  if (product.imagePublicId) await cloudinaryService.deleteImage(product.imagePublicId);
  if (Array.isArray(product.galleryPublicIds)) {
    await cloudinaryService.deleteMultipleImages(product.galleryPublicIds);
  }

  await product.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  req.query.featured = 'true';
  return exports.getProducts(req, res);
});

exports.getProductsByCategory = asyncHandler(async (req, res) => {
  req.query.category = req.params.category;
  return exports.getProducts(req, res);
});

/**
 * Helper function to execute MongoDB Atlas Search ($search) aggregation pipeline.
 * Collection: products
 * Index: default
 * Search fields: name, description, category, subCategory, tags
 * Supports: Full-text search, Partial matching, Fuzzy typo tolerance (maxEdits: 2, prefixLength: 1, maxExpansions: 50), Ranked relevance score.
 * Preserves Mongoose populate() and formatting.
 * 
 * @param {String} q - Search query term
 * @param {Object} extraMatch - Additional MongoDB filter criteria
 * @param {Object} options - Pagination (page, limit) and Sort options
 * @returns {Promise<{results: Array, total: Number}>} Matching products and total count
 */
const executeProductAtlasSearch = async (q, extraMatch = {}, options = {}) => {
  const searchTerm = (q || '').trim();
  if (!searchTerm) return { results: [], total: 0 };

  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 2000;
  const sort = options.sort;

  try {
    const pipeline = [
      {
        $search: {
          index: 'default',
          compound: {
            should: [
              {
                text: {
                  query: searchTerm,
                  path: ['name', 'description', 'category', 'subCategory', 'tags'],
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 1,
                    maxExpansions: 50
                  }
                }
              },
              {
                phrase: {
                  query: searchTerm,
                  path: ['name', 'description', 'category', 'subCategory', 'tags']
                }
              },
              {
                wildcard: {
                  query: `*${searchTerm}*`,
                  path: ['name', 'description', 'category', 'subCategory', 'tags'],
                  allowAnalyzedField: true
                }
              }
            ]
          }
        }
      },
      {
        $addFields: {
          score: { $meta: 'searchScore' }
        }
      }
    ];

    if (extraMatch && Object.keys(extraMatch).length > 0) {
      pipeline.push({ $match: extraMatch });
    }

    let sortStage = { score: -1 };
    if (sort === 'price-low') sortStage = { price: 1, score: -1 };
    else if (sort === 'price-high') sortStage = { price: -1, score: -1 };
    else if (sort === 'rating') sortStage = { ratingsAverage: -1, score: -1 };
    else if (sort === 'newest') sortStage = { createdAt: -1, score: -1 };

    pipeline.push({ $sort: sortStage });

    const allMatches = await Product.aggregate(pipeline);

    if (allMatches && allMatches.length > 0) {
      // Preserve populated reference fields if present in schema
      await Product.populate(allMatches, [
        { path: 'categoryId' },
        { path: 'occasionIds' }
      ]);

      const total = allMatches.length;
      const startIndex = (page - 1) * limit;
      const results = limit >= 2000 ? allMatches : allMatches.slice(startIndex, startIndex + limit);

      return { results, total };
    }
  } catch (err) {
    console.warn('⚠️ Atlas Search unavailable or failed, falling back to regex:', err.message);
  }

  // Helper function to create fuzzy regex pattern for typo tolerance fallback matching
  const buildFuzzyRegex = (term) => {
    const clean = (term || '').toLowerCase().trim();
    if (!clean) return new RegExp('.*', 'i');
    if (clean.length <= 2) return new RegExp(clean, 'i');
    const flexPattern = clean.split('').join('[a-z0-9]*');
    return new RegExp(`(${clean}|${flexPattern})`, 'i');
  };

  // Fallback for partial term search or if Atlas Search returned 0 results / failed
  const queryWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  const regexConditions = queryWords.map(word => {
    const fuzzyRx = buildFuzzyRegex(word);
    return {
      $or: [
        { name: fuzzyRx },
        { description: fuzzyRx },
        { shortDescription: fuzzyRx },
        { category: fuzzyRx },
        { subCategory: fuzzyRx },
        { tags: fuzzyRx }
      ]
    };
  });

  const fallbackQuery = { ...extraMatch, $and: regexConditions };
  let sortQuery = '-createdAt';
  if (sort === 'price-low') sortQuery = 'price';
  if (sort === 'price-high') sortQuery = '-price';
  if (sort === 'rating') sortQuery = '-ratingsAverage';
  if (sort === 'newest') sortQuery = '-createdAt';

  const total = await Product.countDocuments(fallbackQuery);
  const results = await Product.find(fallbackQuery)
    .populate('categoryId')
    .populate('occasionIds')
    .sort(sortQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { results, total };
};

exports.executeProductAtlasSearch = executeProductAtlasSearch;

/**
 * Controller endpoint to handle product search using MongoDB Atlas Search ($search).
 * Endpoint: GET /api/search?q= or GET /api/v1/products/search?q=
 * Collection: products
 * Index: default
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const q = req.query.q || req.query.query || req.query.search || '';
  const { admin, limit = 2000, page = 1, sort } = req.query;
  const searchTerm = q.trim();

  if (!searchTerm || searchTerm.length < 2) {
    return res.status(200).json({ status: 'success', total: 0, data: [] });
  }

  const extraMatch = admin !== 'true' ? { isActive: true } : {};

  try {
    const { results: rawProducts, total } = await executeProductAtlasSearch(searchTerm, extraMatch, { page, limit, sort });

    let products = rawProducts.map(p => {
      const couponData = applyCoupon(p);
      let sellingPrice;
      if (p.hasVariants && p.variants && p.variants.length > 0) {
        sellingPrice = p.variants[0].price;
      } else {
        sellingPrice = p.price;
      }
      return {
        ...p,
        couponAvailable: !!couponData,
        finalPrice: sellingPrice
      };
    });

    res.status(200).json({ status: 'success', total, data: products });
  } catch (error) {
    console.error('Atlas Search Product Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to search products via Atlas Search' });
  }
});