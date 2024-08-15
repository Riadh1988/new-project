import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { mongooseConnect } from '../../../lib/mongoose';
import Ticket from '../../../models/Ticket';

// Define the upload directory inside /tmp
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
        const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || '';
        const user = Array.isArray(fields.user) ? fields.user[0] : fields.user || '';

        const additionalData = {};
        for (const key in fields) {
          if (key !== 'type' && key !== 'status' && key !== 'user') {
            additionalData[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          }
        }

        if (files.screenshot) {
          if (Array.isArray(files.screenshot)) {
            additionalData.files = `/tmp/${path.basename(files.screenshot[0].filepath)}`;
          } else {
            additionalData.files = `/tmp/${path.basename(files.screenshot.filepath)}`;
          }
          
        }
        

        const ticket = new Ticket({
          type,
          status: "in progress",
          user,
          additionalData,
        });

        await ticket.save();
        console.log("ticket ", ticket);
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
