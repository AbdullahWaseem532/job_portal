const pool = require('../config/database');

const applicationController = {
  // GET all applications
  getAllApplications: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT a.*, 
               j.title as job_title, 
               c.company_name,
               up.first_name, 
               up.last_name,
               up.email
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN companies c ON j.company_id = c.company_id
        JOIN users u ON a.user_id = u.user_id
        JOIN user_profiles up ON u.user_id = up.user_id
        ORDER BY a.applied_date DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET application by ID
  getApplicationById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT a.*, 
               j.title as job_title, 
               j.description as job_description,
               c.company_name,
               up.first_name, 
               up.last_name,
               u.email
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN companies c ON j.company_id = c.company_id
        JOIN users u ON a.user_id = u.user_id
        JOIN user_profiles up ON u.user_id = up.user_id
        WHERE a.application_id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET applications by user ID
  getApplicationsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await pool.query(`
        SELECT a.*, 
               j.title as job_title,
               c.company_name,
               j.salary_min,
               j.salary_max,
               j.location
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN companies c ON j.company_id = c.company_id
        WHERE a.user_id = $1
        ORDER BY a.applied_date DESC
      `, [userId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create application
  createApplication: async (req, res) => {
    try {
      const { job_id, user_id, cover_letter } = req.body;
      
      // Check if application already exists
      const existingApp = await pool.query(
        'SELECT application_id FROM applications WHERE job_id = $1 AND user_id = $2',
        [job_id, user_id]
      );

      if (existingApp.rows.length > 0) {
        return res.status(400).json({ error: 'Application already exists for this job' });
      }

      const result = await pool.query(
        'INSERT INTO applications (job_id, user_id, cover_letter) VALUES ($1, $2, $3) RETURNING application_id',
        [job_id, user_id, cover_letter]
      );
      
      res.status(201).json({ 
        message: 'Application submitted successfully', 
        application_id: result.rows[0].application_id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT update application status
  updateApplicationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await pool.query(
        'UPDATE applications SET status = $1, updated_date = CURRENT_TIMESTAMP WHERE application_id = $2 RETURNING *',
        [status, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      res.json({ 
        message: 'Application status updated successfully', 
        application: result.rows[0] 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = applicationController;