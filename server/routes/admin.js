const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { 
  listUsers, 
  resetUserPassword, 
  deleteUser,
  checkConnection,
  showTableSchemas
} = require('../utils/db-tools');

// Only enable in development
if (process.env.NODE_ENV !== 'production') {
  
  // Test database connection
  router.get('/db-status', async (req, res) => {
    try {
      const isConnected = await checkConnection();
      res.json({ connected: isConnected });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Show database schemas
  router.get('/schemas', async (req, res) => {
    try {
      await showTableSchemas();
      res.json({ message: 'Schemas logged to console' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List all users
  router.get('/users', async (req, res) => {
    try {
      const users = await listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete user
  router.delete('/user', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const deletedUser = await deleteUser(email);
      res.json({ 
        message: 'User deleted successfully',
        user: deletedUser
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reset password
  router.post('/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
      }
      
      const updatedUser = await resetUserPassword(email, newPassword);
      res.json({
        message: 'Password reset successful',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List all schedules with user info
  router.get('/schedules', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT s.*, u.email as user_email 
        FROM schedules s 
        LEFT JOIN users u ON s.user_id = u.id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get schedules for specific user
  router.get('/schedules/:userId', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM schedules WHERE user_id = $1',
        [req.params.userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user schedules:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test schedule save
  router.post('/test-schedule', async (req, res) => {
    try {
      const testSchedule = {
        user_id: req.body.user_id,
        name: 'Test Schedule',
        week_data: JSON.stringify({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }),
        visibility: 'private',
        shared_with: []
      };

      const result = await pool.query(`
        INSERT INTO schedules 
        (user_id, name, week_data, visibility, shared_with)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        testSchedule.user_id,
        testSchedule.name,
        testSchedule.week_data,
        testSchedule.visibility,
        testSchedule.shared_with
      ]);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating test schedule:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete all schedules for testing
  router.delete('/schedules', async (req, res) => {
    try {
      await pool.query('DELETE FROM schedules');
      res.json({ message: 'All schedules deleted' });
    } catch (error) {
      console.error('Error deleting schedules:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = router;
