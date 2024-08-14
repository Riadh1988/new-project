import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

export default async (req, res) => {
  if (req.method === 'GET') {
    try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db(dbName);
      const counters = await db.collection('counters').findOne({ _id: 'counters' });

      if (!counters) {
        await db.collection('counters').insertOne({ _id: 'counters', computer: 0, monitor: 0, headphones: 0, mouse: 0, keyboard: 0 });
        res.status(200).json({ computer: 0, monitor: 0, headphones: 0, mouse: 0, keyboard: 0 });
      } else {
        res.status(200).json(counters);
      }

      client.close();
    } catch (error) {
      console.error('Error fetching counters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
