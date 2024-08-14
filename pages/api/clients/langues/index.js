//api/clients/langues/index.js

import { mongooseConnect } from '@/lib/mongoose';
import Language from '@/models/langues';

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({ error: 'Language field is required' });
    }

    try {
      const languageDoc = await Language.create({ language });
      res.status(201).json(languageDoc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const languages = await Language.find();
      res.status(200).json(languages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
