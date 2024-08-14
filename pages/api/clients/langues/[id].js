import { mongooseConnect } from '@/lib/mongoose';
import Language from '@/models/langues';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  await mongooseConnect();

  if (method === 'PUT') {
    const { language } = req.body;
    try {
      const updatedLanguage = await Language.findByIdAndUpdate(id, { language }, { new: true });
      res.status(200).json(updatedLanguage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'DELETE') {
    try {
      await Language.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
