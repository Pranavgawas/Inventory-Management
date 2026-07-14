// Middleware to check if user has required role(s)
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'No user authenticated' });
    }

    // Get user role from the authenticated user
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        msg: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}` 
      });
    }

    next();
  };
};

module.exports = checkRole;
