const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const cacheService = require('../services/cacheService');
const telegramService = require('../services/telegramService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay ENV missing');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

const validateAddress = (address) => {
  if (!address) {
    throw new Error('Address is required');
  }
  if (!address.fullName || !address.fullName.trim()) {
    throw new Error('Full name is required in address');
  }
  if (!address.phone || !address.phone.trim()) {
    throw new Error('Phone number is required in address');
  }
  return true;
};

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { address, discount, deliveryDate, deliverySlot } = req.body;

  if (!req.user || !req.user._id) {
    throw new AppError('Unauthorized user', 401);
  }

  try {
    validateAddress(address);
  } catch (err) {
    throw new AppError(err.message, 400);
  }

  let normalizedSlot = deliverySlot;

  const slotMap = {
    'Morning (9-12)': 'Morning',
    'Afternoon (12-4)': 'Afternoon',
    'Evening (4-8)': 'Evening',
    'Night (8-11)': 'Night',
    'Morning (9AM-12PM)': 'Morning',
    'Afternoon (12PM-4PM)': 'Afternoon',
    'Evening (4PM-8PM)': 'Evening',
    'Night (8PM-11PM)': 'Night',
    '10am-1pm': '10am-1pm',
    '1pm-4pm': '1pm-4pm',
    '4pm-7pm': '4pm-7pm',
    '7pm-10pm': '7pm-10pm'
  };

  if (slotMap[deliverySlot]) {
    normalizedSlot = slotMap[deliverySlot];
  }

  const cartKey = `cart:${req.user._id}`;
  const cartData = await cacheService.get(cartKey);

  if (!cartData) {
    throw new AppError('Cart is empty', 400);
  }

  const cart = typeof cartData === 'string' ? JSON.parse(cartData) : cartData;

  if (!cart.items || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // ✅ PREVENT DUPLICATE ORDERS - Check for existing pending order
  const existingPendingOrder = await Order.findOne({
    userId: req.user._id,
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
  });

  if (existingPendingOrder && existingPendingOrder.razorpayOrderId) {
    // Return existing order instead of creating new one
    return res.status(200).json({
      status: 'success',
      data: {
        razorpayOrder: { id: existingPendingOrder.razorpayOrderId },
        orderId: existingPendingOrder._id,
        pricing: {
          subtotal: existingPendingOrder.subtotal,
          deliveryCharge: existingPendingOrder.deliveryCharge,
          convenienceFee: existingPendingOrder.convenienceFee,
          gst: existingPendingOrder.gst,
          total: existingPendingOrder.total
        }
      }
    });
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);

    if (!product || product.stock < item.qty) {
      throw new AppError(`Stock error: ${product?.name || 'Item'} unavailable`, 400);
    }
  }

  const subtotal = cart.total;
  const deliveryCharge = 50;
  const convenienceFee = subtotal * 0.02;
  const gst = convenienceFee * 0.18;
  const total = subtotal + deliveryCharge + convenienceFee + gst - (discount || 0);

  let razorpayOrder;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new AppError('Failed to create Razorpay order', 500);
  }

  const order = await Order.create({
    userId: req.user._id,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      qty: item.qty,
      price: item.finalPrice ?? item.price ?? 0,
      originalPrice: item.price ?? 0,
      image: item.image,
      couponCode: item.activeCouponCode,
      discountAmount: ((item.price ?? 0) - (item.finalPrice ?? item.price ?? 0)) * item.qty
    })),
    subtotal,
    deliveryCharge,
    convenienceFee,
    gst,
    total,
    discount: discount ?? 0,
    paymentMethod: 'ONLINE',
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    address: {
      fullName: address.fullName?.trim(),
      phone: address.phone?.trim(),
      houseNo: address.houseNo?.trim() || '',
      street: address.street?.trim() || '',
      city: address.city?.trim() || 'Coimbatore',
      pincode: address.pincode?.trim() || '641001',
      lat: address.lat ?? null,
      lng: address.lng ?? null
    },
    deliveryDate: deliveryDate || new Date(),
    deliverySlot: normalizedSlot,
    razorpayOrderId: razorpayOrder.id,
    paymentAttemptAt: new Date(),
    orderNumber: generateOrderNumber(),
    trackingCode: undefined
  });

  await Payment.create({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
    status: 'created'
  });

  res.status(200).json({
    status: 'success',
    data: {
      razorpayOrder,
      orderId: order._id,
      pricing: {
        subtotal,
        deliveryCharge,
        convenienceFee,
        gst,
        total
      }
    }
  });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing payment verification fields', 400);
  }

  // ✅ Check if order already exists and is already paid (prevent duplicate verification)
  const existingOrder = await Order.findById(orderId);
  if (existingOrder && existingOrder.paymentStatus === 'paid') {
    // Order already verified, return success without processing again
    return res.status(200).json({
      status: 'success',
      message: 'Order already verified',
      data: existingOrder
    });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });

    await Payment.findOneAndUpdate(
      { orderId },
      {
        status: 'failed',
        failureReason: 'Payment verification failed'
      }
    );

    throw new AppError('Payment verification failed', 400);
  }

  const order = await Order.findById(orderId).populate('userId');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const year = new Date().getFullYear();
  const orderCount = await Order.countDocuments({
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year + 1}-01-01`)
    }
  });

  const nextNum = (orderCount + 1).toString().padStart(4, '0');
  const trackingCode = `TCM-${year}-${nextNum}`;

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.trackingCode = trackingCode;
  order.orderNumber = order.orderNumber || trackingCode;

  await order.save();

  await Payment.findOneAndUpdate(
    { orderId },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid'
    }
  );

  await cacheService.del(`cart:${order.userId._id}`);

  // Update Stock
  for (const item of order.items) {
    const product = await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: -item.qty } },
      { new: true }
    );

    // Low stock alert
    if (product && product.stock <= 5) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        if (admin.phone) {
          telegramService.sendLowStockAlert(admin.phone, product.name, product.stock).catch(e => console.error(e));
        }
      }
    }
  }

  // Notifications
  try {
    const notificationManager = require('../services/notificationManager');
    if (notificationManager && typeof notificationManager.notifyOrderSuccess === 'function') {
      notificationManager.notifyOrderSuccess(order).catch(err => console.error('Notification error:', err));
    }
  } catch (err) {
    console.error('Failed to load notification manager:', err);
  }

  res.status(200).json({
    status: 'success',
    data: order
  });
});

exports.handlePaymentFailure = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;

  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
      paymentFailureReason: reason || 'Payment failed'
    });

    await Payment.findOneAndUpdate(
      { orderId },
      {
        status: 'failed',
        failureReason: reason || 'Payment failed'
      }
    );
  }

  res.status(200).json({ status: 'success' });
});

exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json({
    status: 'success',
    paymentStatus: order.paymentStatus
  });
});

exports.handleWebhook = asyncHandler(async (req, res) => {
  console.log('Webhook:', req.body);
  res.status(200).send('OK');
});