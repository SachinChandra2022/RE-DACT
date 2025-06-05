// pages/api/testgetlink.js

import { NextResponse } from 'next/server';

export async function POST(req) {
  const { link } = await req.json();

  // Check if the 'link' is provided in the request body
  if (!link) {
    return NextResponse.json({ error: 'Link is required' }, { status: 400 });
  }

  // Respond with the predefined link and username
  const maskedLink="https://test";
  const username="anay"
  return NextResponse.json({
    link:maskedLink,
    username,
  });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
