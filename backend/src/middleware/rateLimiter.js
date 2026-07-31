const rateLimitCache = new Map();

const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
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

    if (record.count > options.max) {
      return res.status(429).json({
        status: 'fail',
        message: options.message
      });
    }

    next();
  };
};

module.exports = rateLimiter;
