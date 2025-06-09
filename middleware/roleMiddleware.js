// middleware/roleMiddleware.js

// Check if user has admin role
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.user_type === 'admin') {
    return next();
  }
  res.status(403).render('error', { error: 'Access denied. Admin privileges required.' });
};

// Check if user has job_seeker role
const isJobSeeker = (req, res, next) => {
  if (req.session.user && req.session.user.user_type === 'job_seeker') {
    return next();
  }
  res.status(403).render('error', { error: 'Access denied. Job seeker privileges required.' });
};

// Check if user has employer role
const isEmployer = (req, res, next) => {
  if (req.session.user && req.session.user.user_type === 'employer') {
    return next();
  }
  res.status(403).render('error', { error: 'Access denied. Employer privileges required.' });
};

module.exports = {
  isAdmin,
  isJobSeeker,
  isEmployer
};