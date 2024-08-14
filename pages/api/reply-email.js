import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, subject, text } = req.body;

    try {
      // Create a transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or another email service
        auth: {
          user: "tickettest050588@gmail.com",
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending email', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
