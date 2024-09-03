import { mongooseConnect } from '@/lib/mongoose';
import Attendance from '@/models/Attendance';
import { startOfWeek, endOfWeek, parseISO, addDays } from 'date-fns';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    const { week } = req.query;

    // Parse la date
    const weekDate = parseISO(week);

    // Calcule le début et la fin de la semaine
    const startDate = startOfWeek(weekDate, { weekStartsOn: 1 });
    const endDate = addDays(startDate, 7); // Fin de la semaine (exclusif)

    try {
      const attendanceRecords = await Attendance.find({
        date: { $gte: startDate, $lt: endDate }
      }).populate('agentId');

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

      res.status(200).json(attendanceData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
  }
}