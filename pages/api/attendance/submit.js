import { mongooseConnect } from '@/lib/mongoose';
import Attendance from '@/models/Attendance';

export default async function handler(req, res) { 

    await mongooseConnect(); 

    if (req.method === 'POST') {
        const attendanceRecords = req.body;

        try {
            const updatedRecords = [];
            for (const record of attendanceRecords) {
                const { agentId, date, status, position, client, extraHours } = record;

                const existingRecord = await Attendance.findOne({ agentId, date });
                if (existingRecord) {
                    existingRecord.status = status;
                    existingRecord.extraHours = extraHours;
                    await existingRecord.save();
                    updatedRecords.push(existingRecord);
                } else {
                    const newRecord = await Attendance.create(record);
                    updatedRecords.push(newRecord);
                }
            } 
            res.status(201).json(updatedRecords);
        } catch (error) {
            console.error('Error processing attendance:', error);
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'GET') {
        const { agentId, startDate, endDate, extraHours } = req.query;

        try {
            const query = { agentId };

            // Filter by date range if provided
            if (startDate && endDate) {
                query.date = { $gte: startDate, $lte: endDate };
            }

            const attendanceRecords = await Attendance.find(query);
            res.status(200).json(attendanceRecords);
        } catch (error) {
            console.error('Error retrieving attendance records:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        console.warn('Method not allowed:', req.method);
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
