const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  type: { type: String, required: true },
  status: { type: String, required: true },
  user: { type: String, required: true },
  fileUrl: { type: String },
  additionalData: {
    type: Map,
    of: String,
  },
  messages: [{
    sender: { type: String, required: true }, // Email of the sender
    receiver: { type: String, required: true }, // Email of the receiver
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Check if the model is already defined and use it, otherwise create a new one
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
