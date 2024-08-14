import { mongooseConnect } from '@/lib/mongoose';
import PC from '@/models/pc';

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { pc } = req.body;

    if (!pc) {
      return res.status(400).json({ error: 'PC field is required' });
    }

    try {
      const pcDoc = await PC.create({ pc });
      res.status(201).json(pcDoc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const pcs = await PC.find();
      res.status(200).json(pcs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
