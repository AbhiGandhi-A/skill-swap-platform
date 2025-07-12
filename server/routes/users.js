const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Admin: Get all users — MUST COME BEFORE `/:id`
router.get('/admin/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Toggle user status
router.patch('/admin/:id/toggle-status', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (public profiles only for regular users)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, skill, page = 1, limit = 10 } = req.query;
    const query = { 
  isActive: true,
  role: { $ne: 'admin' }   // Exclude admin users from public search
};


    if (req.user.role !== 'admin') {
      query.isPublic = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (skill) {
      query.$or = [
        { 'skillsOffered.skill': { $regex: skill, $options: 'i' } },
        { 'skillsWanted.skill': { $regex: skill, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'location', 'profilePhoto', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  Get user profile (MUST COME LAST to avoid route conflict)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-email');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPublic && req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
