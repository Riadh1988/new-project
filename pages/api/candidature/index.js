import { mongooseConnect } from '@/lib/mongoose';
import Candidature from '@/models/candidature';
import Client from '@/models/client'; // Import the Client model

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();

  switch (method) {
    case 'GET':
      try {
        // Ensure the Client model is registered
        const candidatures = await Candidature.find().populate('clientToAssign', 'client');
        res.status(200).json(candidatures);
      } catch (error) {
        console.error('Error fetching candidatures:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch candidatures' });
      }
      break;
    case 'POST':
      try {
        const {
          candidateName,
          phone,
          email,
          language,
          clientToAssign,
          interviewDateTime,
        } = req.body;

        const candidature = new Candidature({
          candidateName,
          phone,
          email,
          language,
          clientToAssign,
          interviewDateTime,
        });

        await candidature.save();

        res.status(201).json({ success: true, data: candidature });
      } catch (error) {
        console.error('Error adding candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to add candidature' });
      }
      break;
    case 'PUT':
      try {
        const {
          id,
          clientDecision,
          declineReason,
          declineComment,
          rescheduleDateTime,
        } = req.body;

        const updateData = {
          clientDecision,
          declineReason,
          declineComment,
          rescheduleDateTime,
        };

        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        const updatedCandidature = await Candidature.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ success: true, data: updatedCandidature });
      } catch (error) {
        console.error('Error updating candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to update candidature' });
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await Candidature.findByIdAndDelete(id);
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting candidature:', error);
        res.status(400).json({ success: false, error: 'Failed to delete candidature' });
      }
      break;
    default:
      res.status(400).json({ success: false, message: 'Unsupported method' });
      break;
  }
}
