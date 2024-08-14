import { mongooseConnect } from '@/lib/mongoose';
import Screen from '@/models/screen';

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { screen } = req.body;

    if (!screen) {
      return res.status(400).json({ error: 'Screen field is required' });
    }

    try {
      const screenDoc = await Screen.create({ screen });
      res.status(201).json(screenDoc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const screens = await Screen.find();
      res.status(200).json(screens);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
