// controllers/applicationController.js
const pool = require('../config/database');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.session.user.id;
    const { cover_letter } = req.body;
    
    // Check if job exists
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE job_id = $1 AND status = $2',
      [jobId, 'active']
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).render('error', { error: 'Job not found or no longer active' });
    }
    
    // Check if user has already applied
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );
    
    if (existingApplication.rows.length > 0) {
      return res.redirect(`/jobs/${jobId}?alreadyApplied=true`);
    }
    
    // Create application
    await pool.query(
      'INSERT INTO applications (job_id, user_id, cover_letter) VALUES ($1, $2, $3)',
      [jobId, userId, cover_letter || null]
    );
    
    // Create notification for company
    const companyUserId = await pool.query(
      'SELECT u.user_id FROM users u JOIN companies c ON u.user_id = c.user_id JOIN jobs j ON c.company_id = j.company_id WHERE j.job_id = $1',
      [jobId]
    );
    
    if (companyUserId.rows.length > 0) {
      const jobTitle = jobResult.rows[0].title;
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [
          companyUserId.rows[0].user_id,
          'New Job Application',
          `A new application has been submitted for job: ${jobTitle}`,
          'application'
        ]
      );
    }
    
    res.redirect(`/jobs/${jobId}?success=true`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error applying for job' });
  }
};

// Update application status (for employers)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.session.user.id;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Verify employer owns the job
    const verifyResult = await pool.query(
      `SELECT a.application_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN companies c ON j.company_id = c.company_id
       WHERE a.application_id = $1 AND c.user_id = $2`,
      [applicationId, userId]
    );
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }
    
    // Update application
    await pool.query(
      'UPDATE applications SET status = $1, updated_date = CURRENT_TIMESTAMP WHERE application_id = $2',
      [status, applicationId]
    );
    
    // Create notification for applicant
    const applicationInfo = await pool.query(
      `SELECT a.user_id, j.title
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       WHERE a.application_id = $1`,
      [applicationId]
    );
    
    if (applicationInfo.rows.length > 0) {
      const { user_id, title } = applicationInfo.rows[0];
      
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [
          user_id,
          'Application Status Updated',
          `Your application for ${title} has been updated to: ${status}`,
          'application'
        ]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// List applications for a job (for employers)
exports.listJobApplications = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.session.user.id;
    
    // Verify employer owns the job
    const verifyResult = await pool.query(
      `SELECT j.job_id, j.title
       FROM jobs j
       JOIN companies c ON j.company_id = c.company_id
       WHERE j.job_id = $1 AND c.user_id = $2`,
      [jobId, userId]
    );
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).render('error', { error: 'Not authorized to view these applications' });
    }
    
    // Get job applications
    const applicationsResult = await pool.query(
      `SELECT a.*, 
          CONCAT(up.first_name, ' ', up.last_name) AS applicant_name,
          up.resume_url, up.experience_years, up.location
       FROM applications a
       JOIN user_profiles up ON a.user_id = up.user_id
       WHERE a.job_id = $1
       ORDER BY 
          CASE 
            WHEN a.status = 'pending' THEN 1
            WHEN a.status = 'reviewed' THEN 2
            WHEN a.status = 'shortlisted' THEN 3
            WHEN a.status = 'hired' THEN 4
            WHEN a.status = 'rejected' THEN 5
          END,
          a.applied_date DESC`,
      [jobId]
    );
    
    // Get applicant skills
    const applicantIds = applicationsResult.rows.map(app => app.user_id);
    
    let applicantSkills = [];
    if (applicantIds.length > 0) {
      const skillsResult = await pool.query(
        `SELECT us.user_id, s.skill_name, us.proficiency_level
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ANY($1)`,
        [applicantIds]
      );
      
      applicantSkills = skillsResult.rows;
    }
    
    res.render('applications/list', {
      job: verifyResult.rows[0],
      applications: applicationsResult.rows,
      applicantSkills
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error loading applications' });
  }
};