const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function listUsers() {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users');
    console.log('Current users:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

async function deleteUser(email) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First check if user exists
    const checkResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length === 0) {
      throw new Error(`User with email ${email} not found`);
    }

    // Delete any related records first (if you have foreign key constraints)
    // For example:
    await client.query(
      'DELETE FROM schedules WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      [email]
    );
    
    await client.query(
      'DELETE FROM emoji_libraries WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      [email]
    );

    // Finally delete the user
    const deleteResult = await client.query(
      'DELETE FROM users WHERE email = $1 RETURNING id, email',
      [email]
    );

    await client.query('COMMIT');
    
    console.log('Deleted user:', deleteResult.rows[0]);
    return deleteResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function resetUserPassword(email, newPassword) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`User with email ${email} not found`);
    }

    await client.query('COMMIT');
    console.log(`Password reset for user:`, result.rows[0]);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting password:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Add a function to check database connection
async function checkConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Add a function to show table schemas
async function showTableSchemas() {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
      `, [table.table_name]);
      
      console.log(`\nTable: ${table.table_name}`);
      console.log('Columns:', columns.rows);
    }
  } catch (error) {
    console.error('Error showing schemas:', error);
    throw error;
  }
}

module.exports = {
  listUsers,
  resetUserPassword,
  deleteUser,
  checkConnection,
  showTableSchemas
};
