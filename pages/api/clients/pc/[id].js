import { mongooseConnect } from '@/lib/mongoose';
import PC from '@/models/pc';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  await mongooseConnect();

  if (method === 'PUT') {
    const { pc } = req.body;
    try {
      const updatedPc = await PC.findByIdAndUpdate(id, { pc }, { new: true });
      res.status(200).json(updatedPc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'DELETE') {
    try {
      await PC.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
