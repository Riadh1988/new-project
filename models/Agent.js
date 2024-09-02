const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  wfh: { 
    type: Boolean,
    default: false 
  },
  
});

const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

module.exports = Agent;
