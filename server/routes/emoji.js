const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { generateUniqueId } = require('../utils/helpers');

router.get('/public', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT unique_id, name, user_id FROM emoji_libraries WHERE visibility = \'public\'';
    const queryParams = [];

    if (search) {
      query += ' AND name ILIKE $1';
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
    const result = await pool.query('SELECT * FROM emoji_libraries WHERE unique_id = $1 AND visibility = \'public\'', [uniqueId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Public emoji library not found', status: 404 } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emoji_libraries WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user emoji libraries:', error);
    res.status(500).json({ error: 'An error occurred while fetching emoji libraries' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  console.log('Server: Received emoji library save request:', req.body);
  
  const client = await pool.connect();
  
  try {
    const { name, emojis, visibility, shared_with } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: { message: 'Library name is required' }
      });
    }

    if (!emojis) {
      return res.status(400).json({ 
        error: { message: 'Emoji data is required' }
      });
    }

    // Parse emojis if it's a string
    const parsedEmojis = typeof emojis === 'string' ? JSON.parse(emojis) : emojis;
    
    // Generate unique ID
    const uniqueId = generateUniqueId();
    
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO emoji_libraries 
       (user_id, name, emojis, visibility, shared_with, unique_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ON CONSTRAINT unique_user_library 
       DO UPDATE SET
         emojis = EXCLUDED.emojis,
         visibility = EXCLUDED.visibility,
         shared_with = EXCLUDED.shared_with,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        name,
        JSON.stringify(parsedEmojis),
        visibility || 'private',
        shared_with || [],
        uniqueId
      ]
    );

    await client.query('COMMIT');
    
    console.log('Server: Save successful, returning:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Server: Error saving emoji library:', error);
    res.status(500).json({ 
      error: { 
        message: 'Error saving emoji library',
        details: error.message
      }
    });
  } finally {
    client.release();
  }
});

router.post('/merge', authenticateToken, async (req, res, next) => {
  try {
    const { sourceId, targetId } = req.body;
    // Implement the merge logic here
    res.json({ message: 'Emoji libraries merged successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
