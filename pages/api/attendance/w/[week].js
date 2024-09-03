// pages/api/attendance/w/[week].js
import { mongooseConnect } from '@/lib/mongoose';
import Attendance from '@/models/Attendance';
import { startOfWeek, endOfWeek } from 'date-fns';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    const { week } = req.query;
    const startDate = startOfWeek(new Date(week), { weekStartsOn: 1 });
    const endDate = endOfWeek(new Date(week), { weekStartsOn: 1 });

    try {
      const attendanceRecords = await Attendance.find({
        date: { $gte: startDate, $lte: endDate }
      }).populate('agentId');

      // Transform records into the desired format
      const attendanceData = attendanceRecords.reduce((acc, record) => {
        const agentId = record.agentId._id.toString(); // Ensure the ID is a string
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

      res.status(200).json(attendanceData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
  }
}
