const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:slug', productController.getProduct);

// Admin/Staff routes
router.post('/', protect, restrictTo('admin', 'staff'), upload.single('image'), productController.createProduct);
router.put('/:id', protect, restrictTo('admin', 'staff'), upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin', 'staff'), productController.deleteProduct);

module.exports = router;