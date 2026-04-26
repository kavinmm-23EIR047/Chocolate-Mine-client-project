const Occasion = require('../models/Occasion');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const cloudinaryService = require('../services/cloudinaryService');

// GET /api/v1/occasions
exports.getOccasions = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query;
  const filter = activeOnly === 'true' ? { active: true } : {};
  const occasions = await Occasion.find(filter).sort('name');
  res.status(200).json({ status: 'success', data: occasions });
});

// GET /api/v1/occasions/active
exports.getActiveOccasions = asyncHandler(async (req, res) => {
  const occasions = await Occasion.find({ active: true }).sort('name');
  res.status(200).json({ status: 'success', data: occasions });
});

// GET /api/v1/occasions/:id
exports.getOccasion = asyncHandler(async (req, res, next) => {
  const occasion = await Occasion.findById(req.params.id);
  if (!occasion) {
    return next(new AppError('Occasion not found', 404));
  }
  res.status(200).json({ status: 'success', data: occasion });
});

// POST /api/v1/occasions
exports.createOccasion = asyncHandler(async (req, res, next) => {
  const { name, label } = req.body;
  
  if (!name) {
    return next(new AppError('Occasion name is required', 400));
  }

  let imageUrl = null;
  let imagePublicId = null;

  // Handle image upload from file
  if (req.file) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploaded = await cloudinaryService.uploadImage(dataUri, 'occasions');
      if (!uploaded) {
        return next(new AppError('Image upload failed', 500));
      }
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    } catch (error) {
      console.error('Image upload error:', error);
      return next(new AppError('Failed to upload image', 500));
    }
  } 
  // Handle image upload from base64 string
  else if (req.body.image) {
    try {
      const uploaded = await cloudinaryService.uploadImage(req.body.image, 'occasions');
      if (!uploaded) {
        return next(new AppError('Image upload failed', 500));
      }
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    } catch (error) {
      console.error('Image upload error:', error);
      return next(new AppError('Failed to upload image', 500));
    }
  } 
  else {
    return next(new AppError('Occasion image is required', 400));
  }

  // Check if occasion already exists
  const existingOccasion = await Occasion.findOne({ name: name.trim().toLowerCase() });
  if (existingOccasion) {
    // Clean up uploaded image if occasion exists
    if (imagePublicId) {
      await cloudinaryService.deleteImage(imagePublicId);
    }
    return next(new AppError('Occasion already exists', 400));
  }

  const occasion = await Occasion.create({
    name: name.trim().toLowerCase(),
    label: label || name.trim(),
    image: imageUrl,
    imagePublicId: imagePublicId
  });

  res.status(201).json({ 
    status: 'success', 
    data: occasion 
  });
});

// PUT /api/v1/occasions/:id
exports.updateOccasion = asyncHandler(async (req, res, next) => {
  const occasion = await Occasion.findById(req.params.id);
  if (!occasion) {
    return next(new AppError('Occasion not found', 404));
  }

  const { name, label, active } = req.body;
  
  if (name) {
    // Check if new name conflicts with existing occasion
    const existingOccasion = await Occasion.findOne({ 
      name: name.trim().toLowerCase(),
      _id: { $ne: req.params.id }
    });
    if (existingOccasion) {
      return next(new AppError('Occasion name already exists', 400));
    }
    occasion.name = name.trim().toLowerCase();
  }
  
  if (label !== undefined) occasion.label = label;
  if (active !== undefined) occasion.active = active === 'true' || active === true;

  // Handle image update
  if (req.file) {
    try {
      // Delete old image
      if (occasion.imagePublicId) {
        await cloudinaryService.deleteImage(occasion.imagePublicId);
      }
      
      // Upload new image
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploaded = await cloudinaryService.uploadImage(dataUri, 'occasions');
      
      if (uploaded) {
        occasion.image = uploaded.secure_url;
        occasion.imagePublicId = uploaded.public_id;
      }
    } catch (error) {
      console.error('Image update error:', error);
      return next(new AppError('Failed to update image', 500));
    }
  }

  await occasion.save();
  
  res.status(200).json({ 
    status: 'success', 
    data: occasion 
  });
});

// DELETE /api/v1/occasions/:id
exports.deleteOccasion = asyncHandler(async (req, res, next) => {
  const occasion = await Occasion.findById(req.params.id);
  if (!occasion) {
    return next(new AppError('Occasion not found', 404));
  }
  
  // Delete image from Cloudinary
  if (occasion.imagePublicId) {
    await cloudinaryService.deleteImage(occasion.imagePublicId);
  }
  
  await occasion.deleteOne();
  
  res.status(204).json({ 
    status: 'success', 
    data: null 
  });
});