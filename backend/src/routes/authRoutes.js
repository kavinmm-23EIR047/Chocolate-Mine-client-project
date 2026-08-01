const express = require('express');
const passport = require('passport');
const Joi = require('joi');

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

/* ==================================
   VALIDATION SCHEMAS
================================== */

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().trim().min(8).max(20).required()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  password: Joi.string().min(6).max(100).required()
});

const verifySignupSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().required()
});

const resendSignupOtpSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

/* ==================================
   AUTH ROUTES
================================== */

// Auth Rate Limiter
const authLimiter = rateLimiter({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many authentication attempts. Please try again later.' 
});


// POST /api/v1/auth/signup
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/register', authLimiter, validate(signupSchema), authController.signup);

// POST /api/v1/auth/verify-signup
router.post('/verify-signup', validate(verifySignupSchema), authController.verifySignup);

// POST /api/v1/auth/resend-signup-otp
router.post('/resend-signup-otp', validate(resendSignupOtpSchema), authController.resendSignupOtp);

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/v1/auth/firebase-login
router.post('/firebase-login', authLimiter, authController.firebaseLogin);

// GET /api/v1/auth/me
router.get('/me', protect, authController.getMe);

/* ==================================
   GOOGLE AUTH
================================== */

// GET /api/v1/auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /api/v1/auth/google/callback
router.get(
  '/google/callback',
  (req, res, next) => {
    const { getFrontendUrl } = require('../utils/urlUtils');
    const frontendUrl = getFrontendUrl();
    passport.authenticate('google', { 
      failureRedirect: `${frontendUrl}/login?error=GoogleAuthFailed`, 
      session: false 
    })(req, res, next);
  },
  authController.googleSuccess
);

/* ==================================
   PASSWORD RESET
================================== */

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/* ==================================
   LOGOUT
================================== */

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

module.exports = router;