// api/tickets/[id]/messages
import { mongooseConnect } from '@/lib/mongoose';
import Ticket from '@/models/Ticket';

export default async function handler(req, res) {
  await mongooseConnect();

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { sender, receiver, text } = req.body;
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      ticket.messages.push({ sender, receiver, text });
      await ticket.save();

      res.status(200).json({ message: 'Message added successfully' });
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ message: 'Error adding message', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.status(200).json(ticket.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
