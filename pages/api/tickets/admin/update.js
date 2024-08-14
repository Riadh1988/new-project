import { mongooseConnect } from '../../../../lib/mongoose';
import Ticket from '../../../../models/Ticket';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'PATCH') {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'Ticket ID and new status are required' });
    }

    try {
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      ticket.status = status;
      await ticket.save();

      res.status(200).json({ message: 'Ticket status updated successfully', data: ticket });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ message: 'Error updating ticket', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
