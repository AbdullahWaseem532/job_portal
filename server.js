const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();
const PORT = process.env.PORT || 6006;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
  secret: 'jobportalsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Global middleware to make user available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { error: 'Page not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});