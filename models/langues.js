import { Schema, model, models } from 'mongoose';

const languageSchema = new Schema({
  language: { type: String, required: true }
});

const Language = models.Language || model('Language', languageSchema);
export default Language;
