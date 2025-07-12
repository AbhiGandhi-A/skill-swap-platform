const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['user_activity', 'swap_stats', 'feedback_logs', 'skill_analytics'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reportSchema.index({ reportType: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);