import { mongooseConnect } from '@/lib/mongoose';
import Headphones from '@/models/headphones';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  await mongooseConnect();

  if (method === 'PUT') {
    const { headphone } = req.body;
    try {
      const updatedHeadphone = await Headphones.findByIdAndUpdate(id, { headphone }, { new: true });
      res.status(200).json(updatedHeadphone);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'DELETE') {
    try {
      await Headphones.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
