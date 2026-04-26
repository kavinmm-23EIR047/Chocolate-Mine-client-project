const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  const newAddress = {
    ...req.body,
    isDefault: user.addresses.length === 0 ? true : req.body.isDefault
  };

  if (newAddress.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push(newAddress);
  await user.save();

  res.status(200).json({ status: 'success', data: user.addresses });
});

exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) return next(new AppError('Address not found', 404));

  Object.assign(address, req.body);

  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) addr.isDefault = false;
    });
  }

  await user.save();
  res.status(200).json({ status: 'success', data: user.addresses });
});

exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
  
  if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.status(200).json({ status: 'success', data: user.addresses });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  res.status(200).json({ status: 'success', data: user.addresses });
});

exports.toggleWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.indexOf(productId);
  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  res.status(200).json({ status: 'success', data: user.wishlist });
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({ status: 'success', data: user.wishlist });
});
