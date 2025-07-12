const express = require('express');
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get active platform messages for users
router.get('/', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const messages = await Message.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
    .populate('createdBy', 'name')
    .sort({ priority: -1, createdAt: -1 })
    .limit(10);

    // Filter out messages already read by user
    const unreadMessages = messages.filter(message => 
      !message.readBy.some(read => read.user.toString() === req.user._id.toString())
    );

    res.json({ messages: unreadMessages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.post('/:messageId/read', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already marked as read
    const alreadyRead = message.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;