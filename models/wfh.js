import { Schema, model, models } from 'mongoose';

const wfhSchema = new Schema({
  candidateName: { type: String, required: true },
  lastName: { type: String, required: true },
  wks: { type: String, required: true },
  computer: { type: String, required: true },
  computerSerial: { type: String, required: true },
  monitorChecked: { type: Boolean, required: true },
  monitor: { type: String, required: false },
  monitorSerial: { type: String, required: false },
  headphonesChecked: { type: Boolean, required: true },
  headphones: { type: String, required: false },
  mouse: { type: String, required: true },
  keyboard: { type: String, required: true },
  date: { type: String, required: true },
  documentName: { type: String, required: true },
  returned: { type: Boolean, default: false },
});

const Wfh = models.Wfh || model('Wfh', wfhSchema);
export default Wfh;
