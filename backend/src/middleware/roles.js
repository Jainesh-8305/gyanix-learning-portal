// backend/src/middleware/roles.js

// Usage: authorize('admin') or authorize('instructor', 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// Specific shortcut middleware
const isStudent = authorize('student', 'instructor', 'admin');
const isInstructor = authorize('instructor', 'admin');
const isAdmin = authorize('admin');

module.exports = { authorize, isStudent, isInstructor, isAdmin };
