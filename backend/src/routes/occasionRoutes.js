const express = require('express');
const occasionController = require('../controllers/occasionController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes - anyone can view occasions
router.get('/', occasionController.getOccasions);
router.get('/active', occasionController.getActiveOccasions);
router.get('/:id', occasionController.getOccasion);

// Admin/Staff only routes - manage occasions
router.post('/', protect, restrictTo('admin', 'staff'), upload.single('image'), occasionController.createOccasion);
router.put('/:id', protect, restrictTo('admin', 'staff'), upload.single('image'), occasionController.updateOccasion);
router.delete('/:id', protect, restrictTo('admin', 'staff'), occasionController.deleteOccasion);

module.exports = router;