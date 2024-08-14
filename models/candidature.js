import { Schema, model, models } from 'mongoose';

const candidatureSchema = new Schema({
  candidateName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  language: { type: String, required: true }, // Add language field
  clientToAssign: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  interviewDateTime: { type: Date, required: true },
  clientDecision: { type: String, enum: ['Accepted', 'Declined', 'Pending'], default: 'Pending' },
  declineReason: { type: String },
  declineComment: { type: String }, // Add decline comment field for 'other' reason
  rescheduleDateTime: { type: Date },
});

const Candidature = models.Candidature || model('Candidature', candidatureSchema);

export default Candidature;
