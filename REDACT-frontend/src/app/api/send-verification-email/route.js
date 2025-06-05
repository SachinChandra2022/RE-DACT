// app/api/send-verification-email/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  const { email, subject, templateId, placeholders } = await req.json();

  if (!email || !subject || !templateId || !placeholders) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  const templates = {
    1: 'Hello [name],\n\nPlease verify your email.\n\nBest,\nYour Company',
  };

  const template = templates[templateId];
  if (!template) {
    return NextResponse.json({ error: 'Invalid template ID.' }, { status: 400 });
  }

  let emailContent = template;
  for (const [placeholder, value] of Object.entries(placeholders)) {
    emailContent = emailContent.replace(`[${placeholder}]`, value);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: emailContent,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
