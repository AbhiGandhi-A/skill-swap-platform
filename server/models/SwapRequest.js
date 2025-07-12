const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedSkill: {
    type: String,
    required: true,
    trim: true
  },
  offeredSkill: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    trim: true,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  proposedDuration: {
    type: String,
    trim: true
  },
  proposedSchedule: {
    type: String,
    trim: true
  },
  acceptedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

swapRequestSchema.index({ requester: 1, recipient: 1 });
swapRequestSchema.index({ status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);