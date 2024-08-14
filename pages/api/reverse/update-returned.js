// pages/api/handle-returned.js
import { mongooseConnect } from '../../../lib/mongoose';
import Client from '../../../models/wfh';

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();

  switch (method) {
    case 'POST':
      try {
        const { clientId } = req.body;

        // Find the client
        const client = await Client.findById(clientId);
        if (!client) {
          return res.status(404).json({ success: false, error: 'Client not found' });
        }

        
 

        // Update client's returned status
        client.returned = true;
        await client.save();

        res.status(200).json({ success: true, data: client });
      } catch (error) {
        console.error('Error updating returned status or counters:', error);
        res.status(400).json({ success: false, error: 'Failed to update returned status or counters' });
      }
      break;
    default:
      res.status(400).json({ success: false, message: 'Unsupported method' });
      break;
  }
}
