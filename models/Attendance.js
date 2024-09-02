// models/Attendance.js
import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present-of', 'present-wfh', 'absent', 'sickleave', 'vacation', 'holiday', 'day-off', 'work-holiday'], required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  extraHours: { type: Number, default: 0 },
});

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

export default Attendance;
