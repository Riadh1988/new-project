import { mongooseConnect } from '@/lib/mongoose';
import Attendance from '@/models/Attendance';
import { startOfWeek, endOfWeek, formatISO } from 'date-fns';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    const { week } = req.query;

    // Parse week date and ensure it's in UTC
    const weekDate = new Date(week);
    const startDate = startOfWeek(weekDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(weekDate, { weekStartsOn: 1 });

    // Convert to ISO strings without time component to avoid timezone issues
    const startISO = formatISO(startDate, { representation: 'date' });
    const endISO = formatISO(endDate, { representation: 'date' });

    console.log('Fetching attendance records between:', startISO, 'and', endISO);

    try {
      const attendanceRecords = await Attendance.find({
        date: { $gte: startISO, $lte: endISO }
      }).populate('agentId');

      console.log('Attendance Records:', attendanceRecords);

      const attendanceData = attendanceRecords.reduce((acc, record) => {
        const agentId = record.agentId._id.toString();
        if (!acc[agentId]) {
          acc[agentId] = [];
        }
        acc[agentId].push({
          date: record.date.toISOString().split('T')[0],
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
  }
}
