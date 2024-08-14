import { mongooseConnect } from '@/lib/mongoose';
import Screen from '@/models/screen';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  await mongooseConnect();

  if (method === 'PUT') {
    const { screen } = req.body;
    try {
      const updatedScreen = await Screen.findByIdAndUpdate(id, { screen }, { new: true });
      res.status(200).json(updatedScreen);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'DELETE') {
    try {
      await Screen.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
