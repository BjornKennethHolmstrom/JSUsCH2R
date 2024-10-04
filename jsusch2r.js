const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-ID']
}));

app.use(express.json());

/* Kept for nostalgic reasons, the original emoji library */
let userSchedule = [
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "🧘", activity: "Meditating"},
  {emoji: "🍵", activity: "Having tea"},
  {emoji: "🎨", activity: "Creating art"},
  {emoji: "👔", activity: "Working"},
  {emoji: "🎮", activity: "Playing games"},
  {emoji: "🎶", activity: "Listening to music"},
  {emoji: "🍲", activity: "Eating lunch"},
  {emoji: "📷", activity: "Taking photos"},
  {emoji: "👔", activity: "Working"},
  {emoji: "💻", activity: "Coding"},
  {emoji: "📝", activity: "Writing"},
  {emoji: "🥗", activity: "Having dinner"},
  {emoji: "🚶", activity: "Walking"},
  {emoji: "💪", activity: "Exercising"},
  {emoji: "🤗", activity: "Socializing"},
  {emoji: "📖", activity: "Reading"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"}
];

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: { message: 'Authentication token is required', status: 401 } });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: { message: 'Invalid or expired token', status: 403 } });
    }
    req.user = user;
    next();
  });
};

// Helper function
function generateUniqueId() {
  return crypto.randomBytes(8).toString('hex');
}

// Public routes (no authentication required)

// User registration
app.post('/api/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
});

// User login
app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: { message: 'Invalid email or password', status: 401 } });
    }

    const user = result.rows[0];
    
    if (await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, userId: user.id });
    } else {
      res.status(401).json({ error: { message: 'Invalid email or password', status: 401 } });
    }
  } catch (error) {
    next(error);
  }
});

// Get public emoji libraries
app.get('/api/emoji-libraries/public', async (req, res, next) => {
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

// Get public emoji library
app.get('/api/emoji-libraries/public/:uniqueId', async (req, res, next) => {
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

// Get public schedules
app.get('/api/schedules/public', async (req, res, next) => {
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

// Get shared schedule
app.get('/api/shared-schedule/:uniqueId', async (req, res, next) => {
  try {
    const { uniqueId } = req.params;
    const scheduleResult = await pool.query('SELECT * FROM schedules WHERE unique_id = $1 AND (visibility = \'public\' OR visibility = \'shared\')', [uniqueId]);
    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Schedule not found or not accessible', status: 404 } });
    }
    const schedule = scheduleResult.rows[0];
    const libraryResult = await pool.query('SELECT * FROM emoji_libraries WHERE id = $1', [schedule.library_id]);
    const library = libraryResult.rows[0];
    res.json({ schedule, library });
  } catch (error) {
    next(error);
  }
});

// Get public schedule
app.get('/api/schedules/public/:uniqueId', async (req, res, next) => {
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

// Protected routes (authentication required)

// Get user's emoji libraries
app.get('/api/emoji-libraries/user/:userId', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM emoji_libraries WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get user's own emoji libraries
app.get('/api/emoji-libraries/user', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM emoji_libraries WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get emoji libraries (public or shared with the user)
app.get('/api/emoji-libraries', authenticateToken, async (req, res, next) => {
  try {
    const { email } = req.query;
    const result = await pool.query(
      `SELECT el.*, u.email as user_email 
       FROM emoji_libraries el 
       JOIN users u ON el.user_id = u.id 
       WHERE el.visibility = 'public' 
       OR (el.visibility = 'shared' AND $1 = ANY(el.shared_with))`,
      [email || '']
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/emoji-libraries/user/:userId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emoji_libraries WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user emoji libraries:', error);
    res.status(500).json({ error: 'An error occurred while fetching emoji libraries' });
  }
});

// Save or update an emoji library
app.post('/api/emoji-libraries', authenticateToken, async (req, res, next) => {
  try {
    const { name, emojis, visibility, sharedWith } = req.body;
    const uniqueId = generateUniqueId();
    const result = await pool.query(
      'INSERT INTO emoji_libraries (user_id, name, emojis, visibility, shared_with, unique_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id, name) DO UPDATE SET emojis = $3, visibility = $4, shared_with = $5 RETURNING *',
      [req.user.id, name, JSON.stringify(emojis), visibility, sharedWith, uniqueId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update an emoji library
app.put('/api/emoji-libraries/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, emojis, visibility, sharedWith } = req.body;
    const result = await pool.query(
      'UPDATE emoji_libraries SET name = $1, emojis = $2, visibility = $3, shared_with = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, JSON.stringify(emojis), visibility, sharedWith, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Emoji library not found or unauthorized', status: 404 } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete an emoji library
app.delete('/api/emoji-libraries/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM emoji_libraries WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Emoji library not found or unauthorized', status: 404 } });
    }
    res.json({ message: 'Emoji library deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Update or create a new schedule
app.post('/api/schedules', authenticateToken, async (req, res, next) => {
  try {
    const { userId, libraryId, name, weekData, visibility, sharedWith } = req.body;
    const uniqueId = generateUniqueId();
    const result = await pool.query(
      'INSERT INTO schedules (user_id, library_id, name, week_data, visibility, shared_with, unique_id) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_id, library_id) DO UPDATE SET name = $3, week_data = $4, visibility = $5, shared_with = $6 RETURNING *',
      [userId, libraryId, name, JSON.stringify(weekData), visibility, sharedWith, uniqueId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get schedules (public or shared with the user)
app.get('/api/schedules', authenticateToken, async (req, res, next) => {
  try {
    const { email } = req.query;
    let query, params;

    if (req.user) {
      query = 'SELECT * FROM schedules WHERE user_id = $1';
      params = [req.user.id];
    } else {
      query = `SELECT s.*, u.email as user_email 
               FROM schedules s 
               JOIN users u ON s.user_id = u.id 
               WHERE s.visibility = 'public' 
               OR (s.visibility = 'shared' AND $1 = ANY(s.shared_with))`;
      params = [email || ''];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/schedules', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'An error occurred while fetching schedules' });
  }
});

// GET route for fetching a schedule library
app.get('/api/schedule-library/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM schedule_libraries WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Schedule library not found', status: 404 } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST route for creating a new schedule library
app.post('/api/schedule-library', authenticateToken, async (req, res, next) => {
  try {
    const { name, schedule, emojiLibrary } = req.body;
    const uniqueId = generateUniqueId();
    const result = await pool.query(
      'INSERT INTO schedule_libraries (user_id, name, schedule, emoji_library, unique_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, JSON.stringify(schedule), JSON.stringify(emojiLibrary), uniqueId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get a specific schedule
app.get('/api/schedules/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Schedule not found or unauthorized', status: 404 } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update a schedule
app.put('/api/schedules/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, libraryId, weekData, visibility, sharedWith } = req.body;
    const result = await pool.query(
      'UPDATE schedules SET name = $1, library_id = $2, week_data = $3, visibility = $4, shared_with = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
      [name, libraryId, JSON.stringify(weekData), visibility, sharedWith, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Schedule not found or unauthorized', status: 404 } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete a schedule
app.delete('/api/schedules/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Schedule not found or unauthorized', status: 404 } });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/schedule-library', authenticateToken, async (req, res) => {
  try {
    const { name, schedule, emojiLibrary } = req.body;
    const uniqueId = generateUniqueId();
    const result = await pool.query(
      'INSERT INTO schedule_libraries (user_id, name, schedule, emoji_library, unique_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, JSON.stringify(schedule), JSON.stringify(emojiLibrary), uniqueId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving schedule library:', error);
    res.status(500).json({ error: 'An error occurred while saving the schedule library' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Resource not found', status: 404 } });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500
    }
  });
});
