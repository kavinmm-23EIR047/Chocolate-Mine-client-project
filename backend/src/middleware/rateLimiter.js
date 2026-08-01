const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, please try again later.' }) => {
  const rateLimitCache = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('localhost');

    // Bypass strict rate limit during local development
    if (process.env.NODE_ENV === 'development' || isLocalhost) {
      return next();
    }

    const maxRequests = options.max || 100;
    const now = Date.now();
    
    if (!rateLimitCache.has(ip)) {
      rateLimitCache.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    const record = rateLimitCache.get(ip);
    
    if (now > record.resetTime) {
      rateLimitCache.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    record.count += 1;
    rateLimitCache.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        status: 'fail',
        message: options.message || 'Too many requests, please try again later.'
      });
    }

    next();
  };
};

module.exports = rateLimiter;

