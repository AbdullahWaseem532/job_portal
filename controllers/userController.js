const pool = require('../config/database');

const userController = {
  // GET all users
  getAllUsers: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.user_id, u.email, u.user_type, u.created_at, u.is_active,
               up.first_name, up.last_name, up.location, up.experience_years
        FROM users u
        LEFT JOIN user_profiles up ON u.user_id = up.user_id
        ORDER BY u.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT u.*, up.first_name, up.last_name, up.phone, up.location, 
               up.resume_url, up.bio, up.experience_years
        FROM users u
        LEFT JOIN user_profiles up ON u.user_id = up.user_id
        WHERE u.user_id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create user
  createUser: async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { email, password_hash, user_type, first_name, last_name, phone, location, bio } = req.body;
      
      // Insert user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING user_id',
        [email, password_hash, user_type]
      );
      
      const userId = userResult.rows[0].user_id;
      
      // Insert user profile
      await client.query(
        'INSERT INTO user_profiles (user_id, first_name, last_name, phone, location, bio) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, first_name, last_name, phone, location, bio]
      );
      
      await client.query('COMMIT');
      res.status(201).json({ message: 'User created successfully', user_id: userId });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  }
};

module.exports = userController;