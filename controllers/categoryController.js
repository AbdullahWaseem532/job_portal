const pool = require('../config/database');

const categoryController = {
  // GET all categories
  getAllCategories: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.*, COUNT(j.job_id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.category_id = j.category_id AND j.status = 'active'
        GROUP BY c.category_id
        ORDER BY job_count DESC, c.category_name
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET category by ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT c.*, COUNT(j.job_id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.category_id = j.category_id AND j.status = 'active'
        WHERE c.category_id = $1
        GROUP BY c.category_id
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create category
  createCategory: async (req, res) => {
    try {
      const { category_name, description } = req.body;
      
      const result = await pool.query(
        'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING category_id',
        [category_name, description]
      );
      
      res.status(201).json({ 
        message: 'Category created successfully', 
        category_id: result.rows[0].category_id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoryController;