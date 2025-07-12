const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true,
    maxLength: 500
  },
  skills: {
    communication: { type: Number, min: 1, max: 5 },
    reliability: { type: Number, min: 1, max: 5 },
    expertise: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
});

ratingSchema.index({ rater: 1, rated: 1, swapRequest: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);