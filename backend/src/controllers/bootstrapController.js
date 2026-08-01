const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Notification = require('../models/Notification');
const { refreshCart } = require('./cartController');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/v1/bootstrap
exports.getBootstrapData = asyncHandler(async (req, res) => {
  // We run these concurrent queries safely using lean()
  const queries = [
    Category.find({ active: true }).sort('name').lean(),
    Banner.find({ isActive: true }).sort('order').lean()
  ];

  // If the user is authenticated, we also fetch their personalized data
  let cartPromise = Promise.resolve({ items: [], total: 0, originalTotal: 0 });
  let unreadCountPromise = Promise.resolve(0);

  if (req.user) {
    cartPromise = refreshCart(req.user._id);
    unreadCountPromise = Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });
  }

  queries.push(cartPromise);
  queries.push(unreadCountPromise);

  const [categories, banners, cart, unreadCount] = await Promise.all(queries);

  res.status(200).json({
    status: 'success',
    data: {
      categories,
      banners,
      cart,
      unreadNotifications: unreadCount,
      user: req.user || null // Return user info as well
    }
  });
});
