// app/api/change-password/route.js
import { NextResponse } from 'next/server';
import ensureTables, { getUserByEmail, getUserByUsername } from '@/lib/db';
import { keccak256 } from 'js-sha3';

export async function POST(req) {
  try {
    await ensureTables();
    const { username, email, oldPassword, newPassword } = await req.json();

    if (!username && !email || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Username or email, old password, and new password are required.' }, { status: 400 });
    }

    let user;
    if (email) {
      user = await getUserByEmail(email);
    } else if (username) {
      user = await getUserByUsername(username);
    }

    if (!user || user.password !== keccak256(oldPassword)) {
      return NextResponse.json({ error: 'Invalid username/email or old password.' }, { status: 401 });
    }

    const hashedNewPassword = keccak256(newPassword);
    await pool.query('UPDATE users SET password = $1 WHERE username = $2 OR email = $3', [hashedNewPassword, username, email]);

    return NextResponse.json({ message: 'Password changed successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error during password change:', error);
    return NextResponse.json({ error: 'Error during password change.' }, { status: 500 });
  }
}
