import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { mongooseConnect } from '../../../lib/mongoose';
import Ticket from '../../../models/Ticket';

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'down');
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

  if (req.method === 'GET') {
    try {
      const tickets = await Ticket.find();
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

      console.log('Parsed fields:', fields);
      console.log('Parsed files:', files);

      try {
        // Extract fields
        const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || '';
        const user = Array.isArray(fields.user) ? fields.user[0] : fields.user || '';

        // Prepare additionalData for storing extra form fields and file URLs
        const additionalData = {};
        for (const key in fields) {
          if (key !== 'type' && key !== 'status' && key !== 'user') {
            additionalData[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          }
        }
 
        // Handle file URLs and add them to additionalData
        if (files.screenshot) {
          if (Array.isArray(files.screenshot)) {
            additionalData.files = `/${path.basename(files.screenshot[0].filepath)}`;
          } else {
            additionalData.files = `/${path.basename(files.screenshot.filepath)}`;
          }
        }


        // Create a new ticket
        const ticket = new Ticket({
          type,
          status: "in progress",
          user,
          additionalData, // Pass the populated additionalData object, including files
        });

        await ticket.save();
        console.log("ticket ",ticket)
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
