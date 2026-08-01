const express = require('express');
const router = express.Router();
const bootstrapController = require('../controllers/bootstrapController');
// We need an optional auth middleware to identify the user if a token exists.
// A typical optionalAuth middleware just tries to decode token and sets req.user without throwing 401 if missing.
// We will create it right here to avoid modifying authMiddleware for now.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    // Just ignore errors and treat as guest if token is invalid
    next();
  }
};

router.get('/', optionalAuth, bootstrapController.getBootstrapData);

module.exports = router;
