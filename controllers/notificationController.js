const pool = require('../config/database');

const notificationController = {
  // GET all notifications
  getAllNotifications: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT n.*, up.first_name, up.last_name
        FROM notifications n
        JOIN users u ON n.user_id = u.user_id
        JOIN user_profiles up ON u.user_id = up.user_id
        ORDER BY n.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET notifications by user ID
  getNotificationsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await pool.query(`
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST create notification
  createNotification: async (req, res) => {
    try {
      const { user_id, title, message, type } = req.body;
      
      const result = await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING notification_id',
        [user_id, title, message, type]
      );
      
      res.status(201).json({ 
        message: 'Notification created successfully', 
        notification_id: result.rows[0].notification_id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;