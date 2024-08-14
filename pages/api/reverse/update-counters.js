import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db(dbName);
      const { computer, laptop, monitor, headphones, mouse, keyboard } = req.body;

      const update = {
        $inc: {
          computer: computer || 0,
          laptop: laptop || 0,
          monitor: monitor || 0,
          headphones: headphones || 0,
          mouse: mouse || 0,
          keyboard: keyboard || 0,
        },
      };

      await db.collection('counters').updateOne({ _id: 'counters' }, update, { upsert: true });

      const updatedCounters = await db.collection('counters').findOne({ _id: 'counters' });

      client.close();

      res.status(200).json(updatedCounters);
    } catch (error) {
      console.error('Error updating counters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
