import Attendance from '@/models/Attendance'; // Import the Attendance model
import Agent from '@/models/Agent'; // Import the Agent model
import { mongooseConnect } from '@/lib/mongoose'; // Import the mongoose connection

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await mongooseConnect(); // Ensure database connection

  switch (method) {
    // Get attendance records for a specific agent
    case 'GET':
      try {
        const attendances = await Attendance.find({ agent: id });
        if (!attendances) {
          return res.status(404).json({ success: false, error: 'No attendance records found' });
        }
        res.status(200).json({ success: true, data: attendances });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    // Create a new attendance record
    case 'POST':
      try {
        const { date, status, extraHours } = req.body;
        
        if (!date || !status) {
          return res.status(400).json({ success: false, error: 'Date and status are required' });
        }

        // Ensure the agent exists
        const agent = await Agent.findById(id);
        if (!agent) {
          return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        // Create a new attendance record
        const attendance = new Attendance({
          agent: id,
          date: new Date(date),
          status,
        });

        await attendance.save();

        res.status(201).json({ success: true, data: attendance });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // Update an existing attendance record
    case 'PUT':
      try {
        const { date, status } = req.body;
        
        if (!date || !status) {
          return res.status(400).json({ success: false, error: 'Date and status are required' });
        }

        const attendance = await Attendance.findOneAndUpdate(
          { agent: id, date: new Date(date) },
          { status },
          { new: true, runValidators: true }
        );

        if (!attendance) {
          return res.status(404).json({ success: false, error: 'Attendance record not found' });
        }

        res.status(200).json({ success: true, data: attendance });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // Delete an attendance record
    case 'DELETE':
      try {
        const { date } = req.body;
        
        if (!date) {
          return res.status(400).json({ success: false, error: 'Date is required' });
        }

        const deletedAttendance = await Attendance.findOneAndDelete({ agent: id, date: new Date(date) });

        if (!deletedAttendance) {
          return res.status(404).json({ success: false, error: 'Attendance record not found' });
        }

        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // Handle unsupported methods
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
