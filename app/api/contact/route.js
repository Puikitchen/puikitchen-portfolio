// Load .env at the very top
import 'dotenv/config';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSKEY,
  },
});


// HTML email template
const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin-left:0;">
        ${userMessage}
      </blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// Send email function
async function sendEmail(payload) {
  const { name, email, message: userMessage } = payload;

  const mailOptions = {
    from: `"Portfolio" <${process.env.EMAIL_ADDRESS}>`,
    to: process.env.EMAIL_ADDRESS,
    subject: `New Message From ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${userMessage}`,
    html: generateEmailTemplate(name, email, userMessage),
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Error sending email:', err.message);
    return false;
  }
}

// API POST handler
export async function POST(request) {
  try {
    // Check env variables
    if (!process.env.EMAIL_ADDRESS || !process.env.GMAIL_PASSKEY) {
      console.error('Missing env variables!');
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const { name, email, message: userMessage } = payload;

    // Validate required fields
    if (!name || !email || !userMessage) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Send email
    const emailSuccess = await sendEmail(payload);

    // Backup log
    const logMessage = `
=== NEW MESSAGE ===
Date: ${new Date().toISOString()}
Name: ${name}
Email: ${email}
Message: ${userMessage}
Email Sent: ${emailSuccess ? 'Yes' : 'No'}
==================
`;
    fs.appendFileSync('contact-messages.txt', logMessage);

    return NextResponse.json(
      {
        success: emailSuccess,
        message: emailSuccess
          ? 'Message sent successfully! I will get back to you soon.'
          : 'Message received but email failed to send.',
      },
      { status: emailSuccess ? 200 : 500 }
    );
  } catch (err) {
    console.error('API Error:', err.message);
    return NextResponse.json(
      { success: false, message: 'Server error occurred.' },
      { status: 500 }
    );
  }
}
