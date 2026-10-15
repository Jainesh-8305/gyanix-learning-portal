const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function authenticate(req) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
  });
  const user = await User.findById(decoded.id);
  if (
    !user?.isActive ||
    (decoded.tokenVersion ?? 0) !== (user.tokenVersion || 0)
  )
    return null;
  return user;
}
const protect = async (req, res, next) => {
  try {
    req.user = await authenticate(req);
    if (!req.user)
      return res.status(401).json({
        success: false,
        message: 'Invalid, expired or revoked session',
      });
    next();
  } catch (error) {
    if (/Token|jwt/i.test(error.name))
      return res
        .status(401)
        .json({ success: false, message: 'Invalid or expired token' });
    next(error);
  }
};
const optionalAuth = async (req, res, next) => {
  try {
    req.user = await authenticate(req);
  } catch {
    req.user = null;
  }
  next();
};
module.exports = { protect, optionalAuth };
