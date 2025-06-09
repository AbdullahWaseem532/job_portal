const pool = require('../config/database');

const reportController = {
  // Job statistics report
  getJobStats: async (req, res) => {
    try {
      const stats = await Promise.all([
        // Jobs by category
        pool.query(`
          SELECT c.category_name, COUNT(j.job_id) as job_count
          FROM categories c
          LEFT JOIN jobs j ON c.category_id = j.category_id AND j.status = 'active'
          GROUP BY c.category_id, c.category_name
          ORDER BY job_count DESC
        `),
        // Jobs by type
        pool.query(`
          SELECT job_type, COUNT(*) as count
          FROM jobs 
          WHERE status = 'active'
          GROUP BY job_type
          ORDER BY count DESC
        `),
        // Application status distribution
        pool.query(`
          SELECT status, COUNT(*) as count
          FROM applications
          GROUP BY status
          ORDER BY count DESC
        `),
        // Monthly job postings
        pool.query(`
          SELECT 
            TO_CHAR(posted_date, 'YYYY-MM') as month,
            COUNT(*) as job_count
          FROM jobs
          WHERE posted_date >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY TO_CHAR(posted_date, 'YYYY-MM')
          ORDER BY month DESC
        `)
      ]);

      res.json({
        jobsByCategory: stats[0].rows,
        jobsByType: stats[1].rows,
        applicationStatus: stats[2].rows,
        monthlyPostings: stats[3].rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Company performance report
  getCompanyStats: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          c.company_name,
          COUNT(DISTINCT j.job_id) as total_jobs,
          COUNT(DISTINCT a.application_id) as total_applications,
          ROUND(AVG(cr.rating), 2) as avg_rating,
          COUNT(DISTINCT cr.review_id) as review_count
        FROM companies c
        LEFT JOIN jobs j ON c.company_id = j.company_id
        LEFT JOIN applications a ON j.job_id = a.job_id
        LEFT JOIN company_reviews cr ON c.company_id = cr.company_id
        GROUP BY c.company_id, c.company_name
        HAVING COUNT(DISTINCT j.job_id) > 0
        ORDER BY total_applications DESC
        LIMIT 10
      `);
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reportController;