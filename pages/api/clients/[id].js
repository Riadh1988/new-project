import { mongooseConnect } from '../../../lib/mongoose';
import Client from '../../../models/client';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await mongooseConnect();

  switch (method) {
    case 'GET':
      try {
        const client = await Client.findById(id);
        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(client);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      const { client } = req.body;

      if (!client) {
        return res.status(400).json({ error: 'Client data is required' });
      }

      try {
        const updatedClient = await Client.findByIdAndUpdate(id, { client }, { new: true });
        if (!updatedClient) {
          return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(updatedClient);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedClient = await Client.findByIdAndDelete(id);
        if (!deletedClient) {
          return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
