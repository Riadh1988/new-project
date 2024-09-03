import { mongooseConnect } from '@/lib/mongoose';
import Attendance from '@/models/Attendance';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    console.log('Received GET request for attendance records');

    try {
      // Fetch all attendance records
      const attendanceRecords = await Attendance.find().populate('agentId');

      console.log('Fetched Attendance Records:', attendanceRecords);

      // Transform the fetched records into the desired format
      const attendanceData = attendanceRecords.reduce((acc, record) => {
        const agentId = record.agentId._id.toString();
        if (!acc[agentId]) {
          acc[agentId] = [];
        }
        acc[agentId].push({
          date: record.date.toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
          status: record.status,
          extraHours: record.extraHours,
        });

        return acc;
      }, {});

      console.log('Transformed Attendance Data:', attendanceData);

      res.status(200).json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
  } else {
    // Handle other HTTP methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
