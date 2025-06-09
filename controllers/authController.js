// controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Display login form
exports.getLogin = (req, res) => {
  res.render('auth/login');
};

// Process login
exports.postLogin = async (req, res) => {
  try {
    const { email, password, user_type } = req.body;

    // Validate inputs
    if (!email || !password || !user_type) {
      return res.render('auth/login', { 
        error: 'Please provide email, password, and user type',
        values: { email, user_type }
      });
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND user_type = $2', 
      [email, user_type]
    );

    const user = userResult.rows[0];

    // Check if user exists
    if (!user) {
      return res.render('auth/login', { 
        error: 'Invalid email or user type',
        values: { email, user_type }
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.render('auth/login', { 
        error: 'Your account has been deactivated. Please contact admin.',
        values: { email, user_type }
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.render('auth/login', { 
        error: 'Invalid password',
        values: { email, user_type }
      });
    }

    // Store user in session
    req.session.user = {
      id: user.user_id,
      email: user.email,
      user_type: user.user_type
    };

    // Redirect based on user type
    switch (user.user_type) {
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
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Server error during login' });
  }
};

// Display user registration form
exports.getUserRegister = (req, res) => {
  res.render('auth/register');
};

// Display company registration form
exports.getCompanyRegister = (req, res) => {
  res.render('auth/register-company');
};

// Process user registration
exports.postUserRegister = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirm_password,
      first_name,
      last_name,
      phone,
      location
    } = req.body;

    // Validate inputs
    if (!email || !password || !confirm_password || !first_name || !last_name) {
      return res.render('auth/register', { 
        error: 'Please fill all required fields',
        values: { email, first_name, last_name, phone, location }
      });
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return res.render('auth/register', { 
        error: 'Passwords do not match',
        values: { email, first_name, last_name, phone, location }
      });
    }

    // Check if email exists
    const emailCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.render('auth/register', { 
        error: 'Email already exists',
        values: { email, first_name, last_name, phone, location }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING user_id',
        [email, password_hash, 'job_seeker']
      );

      const user_id = userResult.rows[0].user_id;

      // Create user profile
      await client.query(
        'INSERT INTO user_profiles (user_id, first_name, last_name, phone, location) VALUES ($1, $2, $3, $4, $5)',
        [user_id, first_name, last_name, phone || null, location || null]
      );

      await client.query('COMMIT');

      // Redirect to login
      req.session.flash = { success: 'Registration successful! Please login.' };
      res.redirect('/login');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.render('auth/register', { 
      error: 'Server error during registration', 
      values: req.body 
    });
  }
};

// Process company registration
exports.postCompanyRegister = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirm_password,
      company_name,
      industry,
      company_size,
      website,
      description,
      location
    } = req.body;

    // Validate inputs
    if (!email || !password || !confirm_password || !company_name) {
      return res.render('auth/register-company', { 
        error: 'Please fill all required fields',
        values: { email, company_name, industry, company_size, website, description, location }
      });
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return res.render('auth/register-company', { 
        error: 'Passwords do not match',
        values: { email, company_name, industry, company_size, website, description, location }
      });
    }

    // Check if email exists
    const emailCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.render('auth/register-company', { 
        error: 'Email already exists',
        values: { email, company_name, industry, company_size, website, description, location }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING user_id',
        [email, password_hash, 'employer']
      );

      const user_id = userResult.rows[0].user_id;

      // Create company
      await client.query(
        'INSERT INTO companies (user_id, company_name, industry, company_size, website, description, location) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user_id, company_name, industry || null, company_size || null, website || null, description || null, location || null]
      );

      await client.query('COMMIT');

      // Redirect to login
      req.session.flash = { success: 'Registration successful! Please login.' };
      res.redirect('/login');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.render('auth/register-company', { 
      error: 'Server error during registration', 
      values: req.body 
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
};