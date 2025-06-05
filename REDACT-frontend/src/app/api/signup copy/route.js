import { NextResponse } from 'next/server';
import { createUser } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import keccak from 'keccak';
import crypto from 'crypto';

// Hash password with Keccak-256
const hashPassword = (password) => {
  return keccak('keccak256').update(password).digest();  // Returns a Buffer
};

export async function POST(req) {
  try {
    // Parse request body
    const { username, email, password } = await req.json();

    // Validate inputs
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Hash password using Keccak-256
    const hashedPassword = hashPassword(password);
    console.log("ho")
    // Create user in the database
    const user = await createUser(username, email, hashedPassword.toString('hex'));  // Store as hex string
    console.log("heo")

    // Generate JWT token
    function createToken(username) {
      const secret = process.env.NEXT_PUBLIC_SALT; // Ensure this is set in your environment
      const hash = crypto.createHmac('sha256', secret)
        .update("\"" + username + "\"")
        .digest('hex');

      console.log("main->>", username)
      return hash;
    }
    const token = createToken(username)
    console.log(username, token)
    // Respond with token and username
    return NextResponse.json({ token, username });
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
