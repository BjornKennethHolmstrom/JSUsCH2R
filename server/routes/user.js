const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { getUserData, saveUserData } = require('../utils/helpers');

router.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await getUserData(userId);
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.post('/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;
    await saveUserData(userId, userData);
    res.json({ message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

module.exports = router;
