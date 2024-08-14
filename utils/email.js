// utils/email.js
import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service here (e.g., Gmail, Outlook, etc.)
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
