import { mongooseConnect } from '../../../../lib/mongoose';
import Ticket from '../../../../models/Ticket';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    try {
      // Retrieve all tickets
      const tickets = await Ticket.find();
      res.status(200).json({ data: tickets });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
