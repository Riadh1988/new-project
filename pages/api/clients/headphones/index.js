import { mongooseConnect } from '@/lib/mongoose';
import Headphones from '@/models/headphones';

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { headphone } = req.body;

    if (!headphone) {
      return res.status(400).json({ error: 'Headphone field is required' });
    }

    try {
      const headphoneDoc = await Headphones.create({ headphone });
      res.status(201).json(headphoneDoc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const headphones = await Headphones.find();
      res.status(200).json(headphones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
