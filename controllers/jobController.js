// controllers/jobController.js
const pool = require('../config/database');

// List all jobs
exports.listJobs = async (req, res) => {
  try {
    const { search, category, jobType, isRemote } = req.query;
    
    let query = `
      SELECT j.*, c.company_name, cat.category_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      LEFT JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.status = 'active'
    `;
    
    const queryParams = [];
    
    // Add search filter
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (j.title ILIKE $${queryParams.length} OR j.description ILIKE $${queryParams.length})`;
    }
    
    // Add category filter
    if (category) {
      queryParams.push(category);
      query += ` AND j.category_id = $${queryParams.length}`;
    }
    
    // Add job type filter
    if (jobType) {
      queryParams.push(jobType);
      query += ` AND j.job_type = $${queryParams.length}`;
    }
    
    // Add remote filter
    if (isRemote === 'true') {
      query += ` AND j.is_remote = TRUE`;
    }
    
    query += ` ORDER BY j.posted_date DESC`;
    
    const result = await pool.query(query, queryParams);
    
    // Get categories for filter
    const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY category_name');
    
    res.render('jobs/list', {
      jobs: result.rows,
      categories: categoriesResult.rows,
      filters: { search, category, jobType, isRemote }
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error loading jobs' });
  }
};

// Display job details
exports.getJobDetails = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    const result = await pool.query(
      `SELECT j.*, c.company_name, c.company_id, c.location AS company_location, 
          c.website, c.description AS company_description, cat.category_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.company_id
       LEFT JOIN categories cat ON j.category_id = cat.category_id
       WHERE j.job_id = $1`,
      [jobId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).render('error', { error: 'Job not found' });
    }
    
    const job = result.rows[0];
    
    // Get required skills
    const skillsResult = await pool.query(
      `SELECT s.skill_name, js.is_required
       FROM job_skills js
       JOIN skills s ON js.skill_id = s.skill_id
       WHERE js.job_id = $1`,
      [jobId]
    );
    
    // Check if user has already applied
    let hasApplied = false;
    if (req.session.user) {
      const applicationResult = await pool.query(
        'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2',
        [jobId, req.session.user.id]
      );
      hasApplied = applicationResult.rows.length > 0;
    }
    
    res.render('jobs/view', {
      job,
      skills: skillsResult.rows,
      hasApplied
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error loading job details' });
  }
};

// Display job creation form
exports.getCreateJob = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get company
    const companyResult = await pool.query(
      'SELECT * FROM companies WHERE user_id = $1',
      [userId]
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(404).render('error', { error: 'Company profile not found' });
    }
    
    // Get categories
    const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY category_name');
    
    // Get skills
    const skillsResult = await pool.query('SELECT * FROM skills ORDER BY skill_name');
    
    res.render('jobs/create', {
      company: companyResult.rows[0],
      categories: categoriesResult.rows,
      skills: skillsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error loading job creation form' });
  }
};

// Process job creation
exports.postCreateJob = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const {
      title,
      category_id,
      description,
      requirements,
      salary_min,
      salary_max,
      job_type,
      location,
      is_remote,
      deadline,
      skills
    } = req.body;
    
    // Validate inputs
    if (!title || !description || !job_type) {
      return res.render('jobs/create', { 
        error: 'Please fill all required fields',
        values: req.body
      });
    }
    
    // Get company
    const companyResult = await pool.query(
      'SELECT * FROM companies WHERE user_id = $1',
      [userId]
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(404).render('error', { error: 'Company profile not found' });
    }
    
    const company_id = companyResult.rows[0].company_id;
    
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create job
      const jobResult = await client.query(
        `INSERT INTO jobs 
          (company_id, category_id, title, description, requirements, 
           salary_min, salary_max, job_type, location, is_remote, deadline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING job_id`,
        [
          company_id,
          category_id || null,
          title,
          description,
          requirements || null,
          salary_min || null,
          salary_max || null,
          job_type,
          location || null,
          is_remote === 'true',
          deadline || null
        ]
      );
      
      const job_id = jobResult.rows[0].job_id;
      
      // Add skills if provided
      if (skills && Array.isArray(skills)) {
        for (const skillId of skills) {
          await client.query(
            'INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2)',
            [job_id, skillId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.redirect('/dashboard/company');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error creating job' });
  }
};