const express = require('express');
const bannerController = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/active', bannerController.getActiveBanners);

// Admin/Staff only routes
router.use(protect);
router.use(restrictTo('admin', 'staff'));

router.route('/')
  .get(bannerController.getAllBanners)
  .post(upload.single('image'), bannerController.createBanner);

router.route('/:id')
  .patch(upload.single('image'), bannerController.updateBanner)
  .delete(bannerController.deleteBanner);

router.patch('/:id/toggle', bannerController.toggleBannerStatus);

module.exports = router;
