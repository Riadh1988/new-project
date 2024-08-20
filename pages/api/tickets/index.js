import { IncomingForm } from 'formidable';
import { getSession } from 'next-auth/react';
import { mongooseConnect } from '../../../lib/mongoose';
import Ticket from '../../../models/Ticket';
import { v2 as cloudinary } from 'cloudinary';



// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await mongooseConnect();
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userEmail = session.user.email;
  const userRole = session.user.role;

  if (req.method === 'GET') {
    try {
      let tickets;
      if (userRole === 'admin') {
        tickets = await Ticket.find();
      } else {
        tickets = await Ticket.find({ user: userEmail });
      }
      res.status(200).json({ data: tickets });
    } catch (error) {
      console.error('Error fetching tickets:', error.message);
      res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
  } else if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form', error: err.message });
      }


      const additionalData = {};
      for (const key in fields) {
        if (Array.isArray(fields[key])) {
          additionalData[key] = fields[key].join(','); // Convert array to comma-separated string
        } else {
          additionalData[key] = fields[key];
        }
      }

      const file = files.screenshot ? files.screenshot[0] : null; // Assuming the field name for the file is 'screenshot'
      let fileUrl = null;

      if (file) {
        try {

          // Upload file to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(file.filepath, {
            folder: 'uploads', // Cloudinary folder
          });

          fileUrl = uploadResult.secure_url; // Retrieve the URL from Cloudinary
          console.log('File uploaded to Cloudinary:', fileUrl);

          // Update additionalData to include the file URL
          additionalData.screenshot = fileUrl;

        } catch (uploadError) {
          console.error('Error uploading file to Cloudinary:', uploadError.message);
          return res.status(500).json({ message: 'Error uploading file to Cloudinary', error: uploadError.message });
        }
      }

      try {
        const ticket = new Ticket({
          type: additionalData.type || '', // Ensure type is a string
          status: 'in progress',
          user: userEmail,
          additionalData, // Include updated additionalData with screenshot URL
        });

        await ticket.save();
        res.status(201).json({ message: 'Ticket created successfully', data: ticket });
      } catch (error) {
        console.error('Error creating ticket:', error.message);
        res.status(500).json({ message: 'Error creating ticket', error: error.message });
      }
    });
  } else {
    console.log(`Method ${req.method} Not Allowed`);
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
