const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const OtpSession = require('../models/OtpSession');
const emailService = require('../services/emailService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSMS, normalizeIndianPhone } = require('../services/smsService');

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );
};

const hasPhoneNumber = (user) => Boolean(user?.phone && String(user.phone).trim() && user.phone !== 'Not provided');
const hasVerifiedPhone = (user) => Boolean(
  hasPhoneNumber(user) && (user.phoneVerified === true || user.provider === 'local')
);

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set HttpOnly access token cookie
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  // Set HttpOnly refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/'
  });

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      phoneNumber: user.phone || null,
      phoneVerified: hasVerifiedPhone(user),
      isVerified: user.isVerified === true,
      fcmTokens: user.fcmTokens || [],
      notificationEnabled: user.notificationEnabled
    }
  });
};

const issueSignupOtp = async (email) => {
  const targetEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 12);
  const otpSession = await OtpSession.create({
    email: targetEmail,
    hashedOtp,
    type: 'register',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await emailService.sendSignupOTP(targetEmail, otp);
  } catch (err) {
    await OtpSession.deleteOne({ _id: otpSession._id });
    throw new AppError('We could not send the verification email. Please try again.', 503);
  }

  return targetEmail;
};

// @desc    Normal Signup / Google Signup Completion
// @route   POST /api/v1/auth/signup
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, isGoogle } = req.body;
  const targetEmail = email.trim().toLowerCase();

  let user = await User.findOne({ email: targetEmail }).select('+password');

  // If user already exists with complete details (both phone & password) and is verified
  if (user && user.isVerified && user.phone && user.password) {
    return next(new AppError('An account with this email already exists. Please sign in.', 400));
  }

  if (user) {
    // User exists (e.g. created via Google without phone/password or unverified local signup)
    user.name = name || user.name;
    user.password = password;
    user.phone = phone;
    if (isGoogle) {
      user.isVerified = true;
      user.provider = 'google';
      user.phoneVerified = false;
    } else {
      user.phoneVerified = true;
    }
    await user.save();

    if (isGoogle) {
      return sendTokenResponse(user, 201, res);
    }
  } else {
    // Create new user
    user = await User.create({
      name,
      email: targetEmail,
      password,
      phone,
      role: 'user',
      active: true,
      isVerified: isGoogle ? true : false,
      provider: isGoogle ? 'google' : 'local',
      phoneVerified: !isGoogle
    });

    if (isGoogle) {
      try {
        const notificationManager = require('../services/notificationManager');
        notificationManager.notifyNewUserRegistration(user).catch(err => console.error('Notification Error:', err));
      } catch (err) {
        console.error('Notification Error:', err);
      }
      return sendTokenResponse(user, 201, res);
    }
  }

  await issueSignupOtp(targetEmail);

  // Respond to frontend for standard local signup
  res.status(201).json({
    status: 'success',
    message: 'OTP sent to your email',
    requiresOtp: true,
    email: targetEmail
  });
});

// @desc    Verify Signup OTP
// @route   POST /api/v1/auth/verify-signup
exports.verifySignup = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Please provide email and otp', 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  console.log(`[Auth] Verifying signup OTP for ${normalizedEmail}`);
  const mongoSession = await mongoose.startSession();
  let user;

  try {
    await mongoSession.withTransaction(async () => {
      const otpSession = await OtpSession.findOne({
        email: normalizedEmail,
        type: 'register',
        isUsed: false,
        expiresAt: { $gt: new Date() }
      }).sort('-createdAt').session(mongoSession);

      if (!otpSession) {
        throw new AppError('OTP expired or not found. Please request a new one.', 400);
      }

      if (!await bcrypt.compare(otp, otpSession.hashedOtp)) {
        throw new AppError('Invalid OTP. Please try again.', 400);
      }

      const claimedSession = await OtpSession.findOneAndUpdate(
        { _id: otpSession._id, isUsed: false },
        { $set: { isUsed: true, verifiedAt: new Date() } },
        { new: true, session: mongoSession }
      );

      if (!claimedSession) {
        throw new AppError('OTP was already used. Please request a new one.', 400);
      }

      user = await User.findOneAndUpdate(
        { email: normalizedEmail, isVerified: { $ne: true } },
        { $set: { isVerified: true } },
        { new: true, session: mongoSession }
      );

      if (!user) {
        throw new AppError('User not found or already verified', 404);
      }
    });
  } catch (err) {
    await mongoSession.endSession();
    if (err.isOperational) return next(err);
    console.error(`[Auth] Failed to persist verification for ${normalizedEmail}:`, err);
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to update verification status. Please try again.'
    });
  }
  await mongoSession.endSession();

  try {
    const notificationManager = require('../services/notificationManager');
    notificationManager.notifyNewUserRegistration(user).catch(err => console.error('Notification Error:', err));
  } catch (err) {
    console.error('Notification Error:', err);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Resend Signup OTP
// @route   POST /api/v1/auth/resend-signup-otp
exports.resendSignupOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  const targetEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: targetEmail });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  if (user.isVerified) {
    return next(new AppError('Account is already verified. Please login.', 400));
  }

  await issueSignupOtp(targetEmail);

  res.status(200).json({
    status: 'success',
    message: 'OTP resent to your email'
  });
});

// @desc    Normal Login
// @route   POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const trimmedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: trimmedEmail,
    active: { $ne: false }
  }).select('+password');

  if (!user) {
    console.log(`❌ Login failed: User not found for ${trimmedEmail}`);
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.password) {
    console.log(`❌ Login failed: User ${trimmedEmail} has no password set (likely a Google user)`);
    return next(new AppError('This account does not have a password. Please login with Google.', 401));
  }

  if (!user.isVerified) {
    try {
      await issueSignupOtp(trimmedEmail);
    } catch (err) {
      return next(err);
    }
    console.log(`❌ Login failed: User ${trimmedEmail} is not verified`);
    // We send a specific error format or message so frontend can handle it and redirect to OTP screen if needed,
    // or just return 403
    return res.status(403).json({
      status: 'fail',
      message: 'Please verify your email first',
      requiresOtp: true,
      email: trimmedEmail
    });
  }

  let isCorrect = false;

  const isHashed =
    user.password &&
    user.password.startsWith('$2');

  if (isHashed) {
    isCorrect = await user.comparePassword(
      password,
      user.password
    );
  } else {
    if (user.password === password) {
      isCorrect = true;
      user.password = password;
      await user.save({
        validateBeforeSave: false
      });
    }
  }

  if (!isCorrect) {
    console.log(`❌ Login failed: Incorrect password for ${trimmedEmail}`);
    return next(new AppError('Invalid email or password', 401));
  }

  user.lastActiveAt = Date.now();

  await user.save({
    validateBeforeSave: false
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Get Current User
// @route   GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const account = await User.findById(req.user._id);
  const phoneVerified = hasVerifiedPhone(account);

  res.status(200).json({
    status: 'success',
    authenticated: true,
    requiresDetails: !phoneVerified,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      phoneNumber: req.user.phone || null,
      phoneVerified,
      isVerified: req.user.isVerified === true,
      fcmTokens: req.user.fcmTokens || [],
      notificationEnabled: req.user.notificationEnabled
    }
  });
});

// @desc    Google OAuth Success Redirect
exports.googleSuccess = asyncHandler(async (req, res) => {
  const { getFrontendUrl } = require('../utils/urlUtils');
  const frontendUrl = getFrontendUrl();

  if (req.user) {
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);

    // Set HttpOnly access token cookie (Session cookie)
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    // Set HttpOnly refresh token cookie (Session cookie)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/'
    });

    res.redirect(
      `${frontendUrl}/oauth-callback?token=${accessToken}`
    );
  } else {
    res.redirect(
      `${frontendUrl}/login?error=GoogleAuthFailed`
    );
  }
});

// @desc    Firebase Auth Backend Synchronization
// @route   POST /api/v1/auth/firebase-login
exports.firebaseLogin = asyncHandler(async (req, res, next) => {
  const { email, name, avatar } = req.body;

  if (!email) {
    return next(new AppError('Email is required for Firebase Login', 400));
  }

  const trimmedEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: trimmedEmail });

  if (!user) {
    try {
      user = await User.create({
        name: name || 'Google User',
        email: trimmedEmail,
        active: true,
        isVerified: true,
        provider: 'google',
        phoneVerified: false
      });
    } catch (error) {
      // Firebase's auth-state listener and the sign-in button can arrive at
      // the API together. Reuse the account created by the other request.
      if (error?.code !== 11000) throw error;
      user = await User.findOne({ email: trimmedEmail });
    }
  } else {
    user.provider = 'google';
    user.isVerified = true;
    user.lastActiveAt = Date.now();
    await user.save({ validateBeforeSave: false });
  }

  // The customer receives a session so they can complete protected phone OTP
  // verification. Route and payment guards keep unverified users from normal use.
  return sendTokenResponse(user, 200, res);
});

// @desc    Send OTP for the authenticated customer's phone verification
// @route   POST /api/v1/auth/phone-verification/send-otp
exports.sendPhoneVerificationOtp = asyncHandler(async (req, res, next) => {
  const phone = normalizeIndianPhone(req.body.phone);
  if (!phone) return next(new AppError('Please enter a valid 10-digit Indian mobile number.', 400));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 12);
  await OtpSession.updateMany(
    { email: req.user.email, type: 'phone_verification', isUsed: false },
    { $set: { isUsed: true } }
  );

  const session = await OtpSession.create({
    email: req.user.email,
    phone,
    hashedOtp,
    type: 'phone_verification',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    maxAttempts: 5
  });

  const result = await sendSMS(phone, `The Chocolate Mine: your mobile verification OTP is ${otp}. It expires in 10 minutes.`);
  if (!result.success) {
    await OtpSession.deleteOne({ _id: session._id });
    return next(new AppError('We could not send the OTP. Please try again.', 503));
  }

  res.status(200).json({ status: 'success', message: 'OTP sent to your mobile number.', phoneNumber: phone });
});

// @desc    Verify the authenticated customer's phone OTP
// @route   POST /api/v1/auth/phone-verification/verify-otp
exports.verifyPhoneVerificationOtp = asyncHandler(async (req, res, next) => {
  const otp = String(req.body.otp || '').trim();
  if (!/^\d{6}$/.test(otp)) return next(new AppError('Please enter the 6-digit OTP.', 400));

  const session = await OtpSession.findOne({
    email: req.user.email,
    type: 'phone_verification',
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort('-createdAt');

  if (!session) return next(new AppError('OTP expired or not found. Please send a new OTP.', 400));
  if (session.attempts >= session.maxAttempts) return next(new AppError('Too many incorrect attempts. Please send a new OTP.', 400));

  if (!await bcrypt.compare(otp, session.hashedOtp)) {
    session.attempts += 1;
    if (session.attempts >= session.maxAttempts) session.isUsed = true;
    await session.save();
    return next(new AppError(`Invalid OTP. ${session.maxAttempts - session.attempts} attempts remaining.`, 400));
  }

  session.isUsed = true;
  session.verifiedAt = new Date();
  await session.save();

  const user = await User.findById(req.user._id);
  user.phone = session.phone;
  user.phoneVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Mobile number verified successfully.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      phoneNumber: user.phone,
      phoneVerified: true,
      isVerified: user.isVerified === true
    }
  });
});

// @desc    Forgot Password - Generate OTP and send email
// @route   POST /api/v1/auth/forgot-password
// @desc    Forgot Password - Generate OTP and send email
// @route   POST /api/v1/auth/forgot-password
// @desc    Forgot Password - Optimized for Fast Frontend Loading
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  const targetEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: targetEmail });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // 1. Generate OTP and Hash it
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 12);

  // 2. Wait for the Database record creation
  const otpSession = await OtpSession.create({
    email: targetEmail,
    hashedOtp,
    type: 'password_reset',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // 3. 💡 OPTIMIZATION: Remove "await" from the email service!
  // This sends the email in the background. Node.js won't block the API response.
  try {
    await emailService.sendPasswordResetOTP(targetEmail, otp);
  } catch (err) {
    await OtpSession.deleteOne({ _id: otpSession._id });
    return next(new AppError('We could not send the password reset email. Please try again.', 503));
  }

  // 4. Respond instantly to the frontend!
  res.status(200).json({
    status: 'success',
    message: 'OTP sent to your email'
  });
});

// @desc    Reset Password - Verify OTP and update password
// @route   POST /api/v1/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return next(
      new AppError(
        'Please provide email, otp and new password',
        400
      )
    );
  }

  const session = await OtpSession.findOne({
    email,
    type: 'password_reset',
    isUsed: false,
    expiresAt: { $gt: new Date() }

  }).sort('-createdAt');

  if (!session) {
    return next(
      new AppError(
        'OTP expired or not found. Please request a new one.',
        400
      )
    );
  }

  const isCorrect = await bcrypt.compare(
    otp,
    session.hashedOtp
  );

  if (!isCorrect) {
    return next(
      new AppError(
        'Invalid OTP. Please try again.',
        400
      )
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new AppError('User not found', 404)
    );
  }

  user.password = password;

  await user.save();

  session.isUsed = true;

  await session.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully'
  });
});
