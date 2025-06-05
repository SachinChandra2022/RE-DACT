const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export async function getUserMetricsByUsername(username) {
    try {
        const query = `
        SELECT username, masks, demasks, validations
        FROM history
        WHERE username = $1;
      `;
        const values = [username];

        console.log('Executing query:', query, 'with values:', values);  // Debugging log

        const res = await pool.query(query, values);

        console.log('Query result:', res.rows);  // Debugging log

        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            console.log('No metrics found for:', username);  // Debugging log
            return null;
        }
    } catch (error) {
        console.error('Error fetching user metrics:', error);
        throw new Error('Database query failed');
    }
}

// db.js
export async function updateUser(username, updatedMetrics) {
    const { incrementMask, incrementDemask, incrementValidation } = updatedMetrics;

    try {
        const query = `
        UPDATE history
        SET masks = masks + $1,
            demasks = demasks + $2,
            validations = validations + $3
        WHERE username = $4
        RETURNING id, username, email, masks, demasks, validations;
        `;
        const values = [incrementMask || 0, incrementDemask || 0, incrementValidation || 0, username];
        const res = await pool.query(query, values);

        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            throw new Error('User update failed');
        }
    } catch (error) {
        console.error('Error updating user metrics:', error);
        throw new Error('Database query failed');
    }
}
// Insert a new user with default values
export async function createUser(username, email) {
    try {
        const query = `
        INSERT INTO history (username, email, masks, demasks, validations)
        VALUES ($1, $2, 0, 0, 0)
        RETURNING id, username, email, masks, demasks, validations;
      `;
        const values = [username, email];
        const res = await pool.query(query, values);

        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            throw new Error('User creation failed');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Database query failed');
    }
}