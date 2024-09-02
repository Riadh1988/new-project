import { mongooseConnect } from '@/lib/mongoose';
import Agent from '@/models/Agent';

export default async function handler(req, res) {
  await mongooseConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const agents = await Agent.find({});
        res.status(200).json({ success: true, data: agents });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'POST':
      try {
        const agent = await Agent.create(req.body);
        res.status(201).json({ success: true, data: agent });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, message: `Method ${method} not allowed` });
      break;
  }
}
