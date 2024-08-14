import { Schema, model, models } from 'mongoose';

const pcSchema = new Schema({
  pc: { type: String, required: true }
});

const PC = models.PC || model('PC', pcSchema);
export default PC;
