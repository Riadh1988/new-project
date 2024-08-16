// /pages/api/candidature/[id].js

import { mongooseConnect } from '@/lib/mongoose';
import Candidature from '@/models/candidature';

export default async function handler(req, res) {
  const { id } = req.query;

  await mongooseConnect();

  switch (req.method) {
    case 'DELETE':
      try {
        const deletedCandidature = await Candidature.findByIdAndDelete(id);

        if (!deletedCandidature) {
          return res.status(404).json({ success: false, error: 'Candidature not found' });
        }

        res.status(200).json({ success: true, data: deletedCandidature });
      } catch (error) {
        console.error('Error deleting candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to delete candidature' });
      }
      break;

    case 'PUT':
      try {
        const updateData = req.body;

        // Remove undefined fields from the update data
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        const updatedCandidature = await Candidature.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCandidature) {
          return res.status(404).json({ success: false, error: 'Candidature not found' });
        }

        res.status(200).json({ success: true, data: updatedCandidature });
      } catch (error) {
        console.error('Error updating candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to update candidature' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method Not Allowed' });
      break;
  }
}
