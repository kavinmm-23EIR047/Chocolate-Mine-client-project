const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/validate', productController.validateCoupon);

module.exports = router;
