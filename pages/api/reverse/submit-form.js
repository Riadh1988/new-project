// pages/api/submit-form.js
import { mongooseConnect } from '../../../lib/mongoose';
import Client from '../../../models/wfh';

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();

  switch (method) {
    case 'GET':
      try {
        const clients = await Client.find();
        res.status(200).json(clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch clients' });
      }
      break;
    case 'POST':
      try {
        const {
          candidateName,
          lastName,
          wks,
          computer,
          computerSerial,
          monitorChecked,
          monitor,
          monitorSerial,
          headphonesChecked,
          headphones,
          mouse,
          keyboard,
          date,
          documentName
        } = req.body;

        const client = new Client({
          candidateName,
          lastName,
          wks,
          computer,
          computerSerial,
          monitorChecked,
          monitor,
          monitorSerial,
          headphonesChecked,
          headphones,
          mouse,
          keyboard,
          date,
          documentName
        });

        await client.save();

        res.status(201).json({ success: true, data: client });
      } catch (error) {
        console.error('Error adding client:', error);
        res.status(400).json({ success: false, error: 'Failed to add client' });
      }
      break;
    default:
      res.status(400).json({ success: false, message: 'Unsupported method' });
      break;
  }
}
