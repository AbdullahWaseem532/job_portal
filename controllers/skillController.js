const pool = require('../config/database');

const skillController = {
  // GET all skills
  getAllSkills: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT s.*, 
               COUNT(DISTINCT us.user_id) as user_count,
               COUNT(DISTINCT js.job_id) as job_count
        FROM skills s
        LEFT JOIN user_skills us ON s.skill_id = us.skill_id
        LEFT JOIN job_skills js ON s.skill_id = js.skill_id
        GROUP BY s.skill_id
        ORDER BY user_count DESC, s.skill_name
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET skill by ID
  getSkillById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT s.*,
               COUNT(DISTINCT us.user_id) as user_count,
               COUNT(DISTINCT js.job_id) as job_count
        FROM skills s
        LEFT JOIN user_skills us ON s.skill_id = us.skill_id
        LEFT JOIN job_skills js ON s.skill_id = js.skill_id
        WHERE s.skill_id = $1
        GROUP BY s.skill_id
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create skill
  createSkill: async (req, res) => {
    try {
      const { skill_name, category } = req.body;
      
      const result = await pool.query(
        'INSERT INTO skills (skill_name, category) VALUES ($1, $2) RETURNING skill_id',
        [skill_name, category]
      );
      
      res.status(201).json({ 
        message: 'Skill created successfully', 
        skill_id: result.rows[0].skill_id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = skillController;