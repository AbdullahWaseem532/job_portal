// middleware/authMiddleware.js

// Check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

// Check if user is NOT logged in
const isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  
  // Redirect based on user type
  switch (req.session.user.user_type) {
    case 'admin':
      res.redirect('/dashboard/admin');
      break;
    case 'job_seeker':
      res.redirect('/dashboard/user');
      break;
    case 'employer':
      res.redirect('/dashboard/company');
      break;
    default:
      res.redirect('/');
  }
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};