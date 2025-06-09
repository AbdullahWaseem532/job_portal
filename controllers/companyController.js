// controllers/companyController.js
const pool = require('../config/database');

// Display company dashboard
exports.getCompanyDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get company profile
    const companyResult = await pool.query(
      'SELECT * FROM companies WHERE user_id = $1',
      [userId]
    );
    
    const company = companyResult.rows[0];
    
    if (!company) {
      return res.status(404).render('error', { error: 'Company profile not found' });
    }
    
    // Get company's jobs
    const jobsResult = await pool.query(
      `SELECT j.*, COUNT(a.application_id) AS application_count 
       FROM jobs j
       LEFT JOIN applications a ON j.job_id = a.job_id
       WHERE j.company_id = $1
       GROUP BY j.job_id
       ORDER BY j.posted_date DESC`,
      [company.company_id]
    );
    
    // Get recent applications for company's jobs
    const applicationsResult = await pool.query(
      `SELECT a.*, j.title AS job_title, 
          CONCAT(up.first_name, ' ', up.last_name) AS applicant_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN user_profiles up ON a.user_id = up.user_id
       WHERE j.company_id = $1
       ORDER BY a.applied_date DESC
       LIMIT 10`,
      [company.company_id]
    );
    
    // Get application stats by status
    const statsResult = await pool.query(
      `SELECT a.status, COUNT(*) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       WHERE j.company_id = $1
       GROUP BY a.status`,
      [company.company_id]
    );
    
    res.render('dashboard/company', {
      company,
      jobs: jobsResult.rows,
      applications: applicationsResult.rows,
      stats: statsResult.rows,
      jobsCount: jobsResult.rowCount,
      applicationsCount: applicationsResult.rowCount
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error loading company dashboard' });
  }
};