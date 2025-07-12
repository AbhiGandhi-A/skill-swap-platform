const express = require('express');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Create swap request
router.post('/', authenticate, async (req, res) => {
  try {
    const { recipient, requestedSkill, offeredSkill, message, proposedDuration, proposedSchedule } = req.body;

    if (recipient === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request swap with yourself' });
    }

    const recipientUser = await User.findById(recipient);
    if (!recipientUser || !recipientUser.isActive) {
      return res.status(404).json({ message: 'Recipient not found or inactive' });
    }

    const existingRequest = await SwapRequest.findOne({
      requester: req.user._id,
      recipient,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request with this user' });
    }

    const swapRequest = await SwapRequest.create({
      requester: req.user._id,
      recipient,
      requestedSkill,
      offeredSkill,
      message,
      proposedDuration,
      proposedSchedule
    });

    await swapRequest.populate(['requester', 'recipient']);

    res.status(201).json({ message: 'Swap request created successfully', swapRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's swap requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (type === 'sent') {
      query.requester = req.user._id;
    } else if (type === 'received') {
      query.recipient = req.user._id;
    } else {
      query.$or = [
        { requester: req.user._id },
        { recipient: req.user._id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name profilePhoto')
      .populate('recipient', 'name profilePhoto')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SwapRequest.countDocuments(query);

    res.json({
      swapRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update swap request status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    const isRecipient = swapRequest.recipient.toString() === req.user._id.toString();
    const isRequester = swapRequest.requester.toString() === req.user._id.toString();

    if (!isRecipient && !isRequester) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    if (status === 'accepted' && !isRecipient) {
      return res.status(403).json({ message: 'Only recipient can accept requests' });
    }

    if (status === 'cancelled' && !isRequester) {
      return res.status(403).json({ message: 'Only requester can cancel requests' });
    }

    swapRequest.status = status;
    
    if (status === 'accepted') {
      swapRequest.acceptedAt = new Date();
    } else if (status === 'cancelled') {
      swapRequest.cancelledAt = new Date();
    } else if (status === 'completed') {
      swapRequest.completedAt = new Date();
    }

    await swapRequest.save();
    await swapRequest.populate(['requester', 'recipient']);

    res.json({ message: 'Swap request updated successfully', swapRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete swap request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swapRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only requester can delete the request' });
    }

    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending requests' });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats for logged-in user
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalSwaps = await SwapRequest.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }]
    });

    const completedSwaps = await SwapRequest.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'completed'
    });

    const pendingRequests = await SwapRequest.countDocuments({
      recipient: userId,
      status: 'pending'
    });

    const user = await User.findById(userId).select('rating');

    res.json({
      totalSwaps,
      completedSwaps,
      pendingRequests,
      averageRating: user?.rating?.average || 0,
      ratingCount: user?.rating?.count || 0
    });
  } catch (error) {
    console.error('❌ Failed to fetch dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});



module.exports = router;
