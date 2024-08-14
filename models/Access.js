// models/Admin.js
import { model, models, Schema } from "mongoose";

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // Add this line if role is needed
}, { timestamps: true });

export const Admin = models?.Admin || model('Admin', adminSchema);

// models/Supervisor.js
const supervisorSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // Add this line if role is needed
}, { timestamps: true });

export const Supervisor = models?.Supervisor || model('Supervisor', supervisorSchema);

// models/Recruitment.js
const recruitmentSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // Add this line if role is needed
}, { timestamps: true });

export const Recruitment = models?.Recruitment || model('Recruitment', recruitmentSchema);
