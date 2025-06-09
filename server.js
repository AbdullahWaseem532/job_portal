const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const userRoutes = require('./routes/users');
// const jobRoutes = require('./routes/jobs');
// const applicationRoutes = require('./routes/applications');
// const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
// app.use('/api/users', userRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api/reports', reportRoutes);

app.get('/api/check', (req, res) => {
  res.json({ message: 'Job Portal API is running 0!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});