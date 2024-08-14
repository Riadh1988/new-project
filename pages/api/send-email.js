import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, subject, text } = req.body;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "tickettest050588@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "m.joksimovic@oceancallcentre.com",
      cc:to,
      subject: subject,
      text: text,
    };

    try {
      let info = await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent', info });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
