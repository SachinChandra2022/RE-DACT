import { Pool } from 'pg';

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL, // Make sure this is set in your .env file
  ssl: {
    rejectUnauthorized: false, // For local development, this may be required. Adjust as necessary.
  },
});

// Function to check if the users table exists and create it if it does not
async function ensureUsersTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `;
    await pool.query(query);
  } catch (error) {
    console.error('Error in ensureUsersTable:', error);
    throw new Error('Failed to ensure users table');
  }
}

// Function to find a user by email
export async function findUserByEmail(email) {
  try {
    const query = `
      SELECT id, username, email, password
      FROM users
      WHERE email = $1;
    `;
    const values = [email];
    const res = await pool.query(query, values);

    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw new Error('Database query failed');
  }
}

// Function to create a new user in the database if they do not already exist
export async function createUser(username, email, hashedPassword) {
  try {
    // Ensure the users table exists
    await ensureUsersTable();

    // Check if the user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Insert the new user into the database
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email;
    `;
    const values = [username, email, hashedPassword];
    const res = await pool.query(query, values);

    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      throw new Error('User creation failed');
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error('Database query failed');
  }
}
