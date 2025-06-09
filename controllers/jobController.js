const pool = require('../config/database');

const jobController = {
  // GET all jobs
  getAllJobs: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT j.*, c.company_name, cat.category_name
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.company_id
        LEFT JOIN categories cat ON j.category_id = cat.category_id
        WHERE j.status = 'active'
        ORDER BY j.posted_date DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET job by ID
  getJobById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT j.*, c.company_name, c.description as company_description,
               cat.category_name,
               COUNT(a.application_id) as application_count
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.company_id
        LEFT JOIN categories cat ON j.category_id = cat.category_id
        LEFT JOIN applications a ON j.job_id = a.job_id
        WHERE j.job_id = $1
        GROUP BY j.job_id, c.company_name, c.description, cat.category_name
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create job
  createJob: async (req, res) => {
    try {
      const { company_id, category_id, title, description, requirements, 
              salary_min, salary_max, job_type, location, is_remote, deadline } = req.body;
      
      const result = await pool.query(
        `INSERT INTO jobs (company_id, category_id, title, description, requirements, 
         salary_min, salary_max, job_type, location, is_remote, deadline) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING job_id`,
        [company_id, category_id, title, description, requirements, 
         salary_min, salary_max, job_type, location, is_remote, deadline]
      );
      
      res.status(201).json({ 
        message: 'Job created successfully', 
        job_id: result.rows[0].job_id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = jobController;