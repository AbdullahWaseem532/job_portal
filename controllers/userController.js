// controllers/userController.js
const pool = require('../config/database');

// Display user dashboard
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user profile
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    const profile = profileResult.rows[0] || {};
    
    // Get all jobs
    const jobsResult = await pool.query(
      `SELECT j.*, c.company_name, COUNT(a.application_id) AS applied_count
       FROM jobs j
       JOIN companies c ON j.company_id = c.company_id
       LEFT JOIN applications a ON j.job_id = a.job_id AND a.user_id = $1
       WHERE j.status = 'active'
       GROUP BY j.job_id, c.company_name
       ORDER BY j.posted_date DESC
       LIMIT 10`,
      [userId]
    );
    
    // Get user's applications
    const applicationsResult = await pool.query(
      `SELECT a.*, j.title AS job_title, c.company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN companies c ON j.company_id = c.company_id
       WHERE a.user_id = $1
       ORDER BY a.applied_date DESC`,
      [userId]
    );
    
    res.render('dashboard/user', {
      profile,
      jobs: jobsResult.rows,
      applications: applicationsResult.rows,
      applicationsCount: applicationsResult.rowCount
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error loading dashboard' });
  }
};

// Display admin dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get counts
    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE user_type = 'job_seeker') AS job_seekers_count,
        (SELECT COUNT(*) FROM users WHERE user_type = 'employer') AS employers_count,
        (SELECT COUNT(*) FROM jobs) AS jobs_count,
        (SELECT COUNT(*) FROM applications) AS applications_count
    `);
    
    // Get recent users
    const usersResult = await pool.query(`
      SELECT u.*, 
        CASE 
          WHEN u.user_type = 'job_seeker' THEN CONCAT(up.first_name, ' ', up.last_name)
          WHEN u.user_type = 'employer' THEN c.company_name
          ELSE 'Admin'
        END AS name
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id AND u.user_type = 'job_seeker'
      LEFT JOIN companies c ON u.user_id = c.user_id AND u.user_type = 'employer'
      ORDER BY u.created_at DESC
      LIMIT 10
    `);
    
    // Get recent jobs
    const jobsResult = await pool.query(`
      SELECT j.*, c.company_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      ORDER BY j.posted_date DESC
      LIMIT 10
    `);
    
    // Get application stats for chart
    const applicationStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);
    
    res.render('dashboard/admin', {
      counts: counts.rows[0],
      users: usersResult.rows,
      jobs: jobsResult.rows,
      applicationStats: applicationStats.rows
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Error loading admin dashboard' });
  }
};