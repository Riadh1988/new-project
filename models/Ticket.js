import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  type: { type: String, required: true },
  status: { type: String, required: true },
  user: { type: String, required: true },
  additionalData: {
    type: Map,
    of: String,
  },
  
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
