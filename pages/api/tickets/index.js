import { getSession } from 'next-auth/react'; // If using NextAuth.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { mongooseConnect } from '../../../lib/mongoose';
import Ticket from '../../../models/Ticket';

const uploadDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await mongooseConnect();

  // Get the session to identify the logged-in user
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userEmail = session.user.email; // Assuming session.user.email contains the user's email
  const userRole = session.user.role; // Assuming session.user.role contains the user's role

  if (req.method === 'GET') {
    try {
      let tickets;
      if (userRole === 'admin') {
        // If the user is an admin, return all tickets
        tickets = await Ticket.find();
      } else {
        // If the user is not an admin, return only their tickets
        tickets = await Ticket.find({ user: userEmail });
      }
      res.status(200).json({ data: tickets });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
  } else if (req.method === 'POST') {
    const form = formidable({ multiples: true, uploadDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(400).json({ success: false, error: 'Error parsing form data' });
      }

      try {
        const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || '';
        const additionalData = {};
        for (const key in fields) {
          if (key !== 'type' && key !== 'status' && key !== 'user') {
            additionalData[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          }
        }

        if (files.screenshot) {
          additionalData.files = Array.isArray(files.screenshot) ? `/tmp/${path.basename(files.screenshot[0].filepath)}` : `/tmp/${path.basename(files.screenshot.filepath)}`;
        }

        // Create a new ticket with the user email from the session
        const ticket = new Ticket({
          type,
          status: "in progress",
          user: userEmail, // Use the user's email from the session
          additionalData,
        });

        await ticket.save();
        res.status(201).json({ message: 'Ticket created successfully', data: ticket });
      } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Error creating ticket', error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
