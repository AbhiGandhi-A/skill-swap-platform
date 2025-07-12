const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['skill_rejected', 'user_banned', 'user_unbanned', 'profile_flagged', 'content_removed'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

moderationLogSchema.index({ moderator: 1, createdAt: -1 });
moderationLogSchema.index({ targetUser: 1, createdAt: -1 });
moderationLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('ModerationLog', moderationLogSchema);