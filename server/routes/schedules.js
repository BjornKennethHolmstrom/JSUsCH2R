const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { generateUniqueId, saveSchedule } = require('../utils/helpers');

// Public schedule routes
router.get('/public', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT s.unique_id, s.name, u.email as user_email FROM schedules s JOIN users u ON s.user_id = u.id WHERE s.visibility = \'public\'';
    const queryParams = [];

    if (search) {
      query += ' AND s.name ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/public/:uniqueId', async (req, res, next) => {
  try {
    const { uniqueId } = req.params;
    const result = await pool.query('SELECT * FROM schedules WHERE unique_id = $1 AND visibility = \'public\'', [uniqueId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Public schedule not found', status: 404 } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Protected schedule routes
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM schedules WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    console.log('Fetched schedules for user:', req.user.id, result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    next(error);
  }
});

// Save schedule
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, weekData, visibility, sharedWith } = req.body;
    const userId = req.user.id;

    if (!weekData) {
      return res.status(400).json({ 
        error: { 
          message: 'Week data is required' 
        } 
      });
    }

    const uniqueId = generateUniqueId();
    
    // Always create a new schedule
    const result = await pool.query(
      `INSERT INTO schedules 
       (user_id, name, week_data, visibility, shared_with, unique_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        name || 'My Schedule',
        JSON.stringify(weekData),
        visibility || 'private',
        sharedWith || [],
        uniqueId
      ]
    );

    console.log('New schedule saved:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving schedule:', error);
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM schedules WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Schedule not found',
          scheduleId: req.params.id
        }
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    next(error);
  }
});

// Update schedule
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name, weekData, visibility, sharedWith } = req.body;
    const scheduleId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE schedules 
       SET name = $1, 
           week_data = $2, 
           visibility = $3, 
           shared_with = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        name || 'My Schedule',
        JSON.stringify(weekData),
        visibility || 'private',
        sharedWith || [],
        scheduleId,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Schedule not found or unauthorized',
          scheduleId
        }
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    next(error);
  }
});

// Delete schedule
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Schedule not found or unauthorized',
          scheduleId: req.params.id
        }
      });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    next(error);
  }
});

router.get('/schema', async (req, res) => {
  try {
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'schedules'
    `);
    res.json(schema.rows);
  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
