import { Schema, model, models } from 'mongoose';

const headphonesSchema = new Schema({
  headphone: { type: String, required: true }
});

const Headphones = models.Headphones || model('Headphones', headphonesSchema);
export default Headphones;
