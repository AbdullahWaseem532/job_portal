const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const reportRoutes = require('./routes/reports');
const companyRoutes = require('./routes/companies');
const categoryRoutes = require('./routes/categories');
const skillRoutes = require('./routes/skills');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Job Portal API is running!', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Job Portal API',
    endpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
      companies: '/api/companies',
      categories: '/api/categories',
      skills: '/api/skills',
      notifications: '/api/notifications',
      reports: '/api/reports',
      dashboard: '/dashboard.html'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Job Portal Server is running on port ${PORT}`);
  console.log(`📊 Dashboard available at: http://localhost:${PORT}/dashboard.html`);
  console.log(`🔗 API Health check: http://localhost:${PORT}/api/health`);
});