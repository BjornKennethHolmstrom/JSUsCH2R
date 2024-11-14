const crypto = require('crypto');
const pool = require('../config/db');

function generateUniqueId() {
  return crypto.randomBytes(8).toString('hex');
}

async function getUserData(userId) {
  try {
    const scheduleResult = await pool.query('SELECT * FROM schedules WHERE user_id = $1', [userId]);
    const emojiLibraryResult = await pool.query('SELECT * FROM emoji_libraries WHERE user_id = $1', [userId]);
    
    return {
      weekSchedule: scheduleResult.rows[0]?.week_data || {},
      emojiLibrary: emojiLibraryResult.rows[0]?.emojis || [],
      currentLibraryId: emojiLibraryResult.rows[0]?.id || null,
      currentLibraryName: emojiLibraryResult.rows[0]?.name || ''
    };
  } catch (error) {
    console.error('Error in getUserData:', error);
    throw new Error('Failed to fetch user data');
  }
}

async function saveUserData(userId, userData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'INSERT INTO schedules (user_id, week_data) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET week_data = $2',
      [userId, JSON.stringify(userData.weekSchedule)]
    );

    await client.query(
      'INSERT INTO emoji_libraries (user_id, name, emojis) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET name = $2, emojis = $3',
      [userId, userData.currentLibraryName, JSON.stringify(userData.emojiLibrary)]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in saveUserData:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function saveSchedule(userId, scheduleData) {
  try {
    const { name, weekData, visibility, sharedWith } = scheduleData;
    const uniqueId = generateUniqueId();
    
    const result = await pool.query(
      'INSERT INTO schedules (user_id, name, week_data, visibility, shared_with, unique_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id) DO UPDATE SET name = $2, week_data = $3, visibility = $4, shared_with = $5 RETURNING *',
      [userId, name, JSON.stringify(weekData), visibility, sharedWith, uniqueId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error in saveSchedule:', error);
    throw error;
  }
}

module.exports = {
  generateUniqueId,
  getUserData,
  saveUserData,
  saveSchedule
};
