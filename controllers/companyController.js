const pool = require('../config/database');

const companyController = {
  // GET all companies
  getAllCompanies: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.*, 
               COUNT(DISTINCT j.job_id) as total_jobs,
               COUNT(DISTINCT cr.review_id) as review_count,
               ROUND(AVG(cr.rating), 2) as avg_rating
        FROM companies c
        LEFT JOIN jobs j ON c.company_id = j.company_id
        LEFT JOIN company_reviews cr ON c.company_id = cr.company_id
        GROUP BY c.company_id
        ORDER BY c.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET company by ID
  getCompanyById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT c.*,
               COUNT(DISTINCT j.job_id) as total_jobs,
               COUNT(DISTINCT cr.review_id) as review_count,
               ROUND(AVG(cr.rating), 2) as avg_rating
        FROM companies c
        LEFT JOIN jobs j ON c.company_id = j.company_id
        LEFT JOIN company_reviews cr ON c.company_id = cr.company_id
        WHERE c.company_id = $1
        GROUP BY c.company_id
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create company
  createCompany: async (req, res) => {
    try {
      const { user_id, company_name, industry, company_size, website, description, location, logo_url } = req.body;
      
      const result = await pool.query(
        `INSERT INTO companies (user_id, company_name, industry, company_size, website, description, location, logo_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING company_id`,
        [user_id, company_name, industry, company_size, website, description, location, logo_url]
      );
      
      res.status(201).json({ 
        message: 'Company created successfully', 
        company_id: result.rows[0].company_id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = companyController;