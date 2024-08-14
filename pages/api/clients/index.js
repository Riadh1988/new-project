import { mongooseConnect } from '../../../lib/mongoose';
import Client from '../../../models/client';

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { client } = req.body;

    if (!client) {
      return res.status(400).json({ error: 'Client field is required' });
    }

    try {
      const productDoc = await Client.create({ client });
      res.status(201).json(productDoc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const clients = await Client.find();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } 
   else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}


