// models/Client.js
import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema({
  client: { type: String, required: true },
  workers: [{ type: Schema.Types.ObjectId, ref: 'Worker' }]
});

const Client = models.Client || model('Client', clientSchema);
export default Client;
