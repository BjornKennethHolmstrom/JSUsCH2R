const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: { 
          message: 'User already exists',
          status: 400 
        } 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );

    res.status(201).json({ 
      id: result.rows[0].id, 
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  console.log('Server: Login attempt received', {
    email: req.body.email,
    headers: req.headers
  });

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Server: Missing email or password');
      return res.status(400).json({ 
        error: { 
          message: 'Email and password are required',
          status: 400 
        } 
      });
    }
    
    console.log('Server: Querying database for user');
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    
    console.log('Server: Database query complete, rows found:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('Server: User not found');
      return res.status(401).json({ 
        error: { 
          message: 'Invalid email or password',
          status: 401 
        } 
      });
    }

    const user = result.rows[0];
    console.log('Server: Comparing passwords');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      console.log('Server: Password mismatch');
      return res.status(401).json({ 
        error: { 
          message: 'Invalid email or password',
          status: 401 
        } 
      });
    }

    console.log('Server: Creating JWT token');
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Server: Login successful, sending response');
    res.json({ 
      token,
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Server: Login error:', error);
    next(error);
  }
});

// Add a test endpoint to verify the server is running
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

module.exports = router;
