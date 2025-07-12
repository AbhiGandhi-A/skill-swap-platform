const express = require('express');
const Rating = require('../models/Rating');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Create rating
router.post('/', authenticate, async (req, res) => {
  try {
    const { swapRequestId, ratedUserId, rating, feedback, skills } = req.body;

    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest || swapRequest.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed swaps' });
    }

    const isParticipant = swapRequest.requester.toString() === req.user._id.toString() || 
                         swapRequest.recipient.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to rate this swap' });
    }

    const existingRating = await Rating.findOne({
      swapRequest: swapRequestId,
      rater: req.user._id,
      rated: ratedUserId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this user for this swap' });
    }

    const newRating = await Rating.create({
      swapRequest: swapRequestId,
      rater: req.user._id,
      rated: ratedUserId,
      rating,
      feedback,
      skills
    });

    // Update user's average rating
    const userRatings = await Rating.find({ rated: ratedUserId });
    const averageRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
    
    await User.findByIdAndUpdate(ratedUserId, {
      'rating.average': Math.round(averageRating * 10) / 10,
      'rating.count': userRatings.length
    });

    await newRating.populate(['rater', 'rated', 'swapRequest']);

    res.status(201).json({ message: 'Rating created successfully', rating: newRating });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get ratings for a user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const ratings = await Rating.find({ rated: req.params.userId })
      .populate('rater', 'name profilePhoto')
      .populate('swapRequest', 'requestedSkill offeredSkill')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Rating.countDocuments({ rated: req.params.userId });

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;