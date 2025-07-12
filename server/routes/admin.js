const express = require('express');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Rating = require('../models/Rating');
const Message = require('../models/Message');
const Report = require('../models/Report');
const ModerationLog = require('../models/ModerationLog');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Get admin dashboard stats
router.get('/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSwaps = await SwapRequest.countDocuments();
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const totalRatings = await Rating.countDocuments();
    const averageRating = await Rating.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt isActive');

    const recentSwaps = await SwapRequest.find()
      .populate('requester', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalSwaps,
        pendingSwaps,
        completedSwaps,
        totalRatings,
        averageRating: averageRating[0]?.avgRating || 0
      },
      recentActivity: {
        users: recentUsers,
        swaps: recentSwaps
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Moderate user skills
router.post('/moderate/skills/:userId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, skillType, skillIndex, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'reject_skill') {
      if (skillType === 'offered' && user.skillsOffered[skillIndex]) {
        const rejectedSkill = user.skillsOffered[skillIndex];
        user.skillsOffered.splice(skillIndex, 1);
        
        // Log moderation action
        await ModerationLog.create({
          moderator: req.user._id,
          targetUser: userId,
          action: 'skill_rejected',
          reason,
          details: { skillType, rejectedSkill },
          severity: 'medium'
        });
      } else if (skillType === 'wanted' && user.skillsWanted[skillIndex]) {
        const rejectedSkill = user.skillsWanted[skillIndex];
        user.skillsWanted.splice(skillIndex, 1);
        
        await ModerationLog.create({
          moderator: req.user._id,
          targetUser: userId,
          action: 'skill_rejected',
          reason,
          details: { skillType, rejectedSkill },
          severity: 'medium'
        });
      }

      await user.save();
    }

    res.json({ message: 'Moderation action completed successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ban/Unban users
router.patch('/users/:userId/ban', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wasBanned = !user.isActive;
    user.isActive = !user.isActive;
    
    if (!user.isActive && duration) {
      user.banExpiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    } else {
      user.banExpiresAt = undefined;
    }

    await user.save();

    // Log moderation action
    await ModerationLog.create({
      moderator: req.user._id,
      targetUser: userId,
      action: wasBanned ? 'user_unbanned' : 'user_banned',
      reason: reason || 'No reason provided',
      details: { duration },
      severity: 'high'
    });

    res.json({ 
      message: `User ${user.isActive ? 'unbanned' : 'banned'} successfully`, 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all swap requests for monitoring
router.get('/swaps', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const swaps = await SwapRequest.find(query)
      .populate('requester', 'name email isActive')
      .populate('recipient', 'name email isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SwapRequest.countDocuments(query);

    res.json({
      swaps,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create platform-wide message
router.post('/messages', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { title, content, type, priority, expiresAt } = req.body;

    const message = await Message.create({
      title,
      content,
      type,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Platform message created successfully', data: message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get platform messages
router.get('/messages', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const messages = await Message.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments();

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update message status
router.patch('/messages/:messageId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { messageId } = req.params;
    const { isActive } = req.body;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isActive },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message updated successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate reports
router.post('/reports/generate', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let data = {};

    switch (reportType) {
      case 'user_activity':
        data = await generateUserActivityReport(start, end);
        break;
      case 'swap_stats':
        data = await generateSwapStatsReport(start, end);
        break;
      case 'feedback_logs':
        data = await generateFeedbackLogsReport(start, end);
        break;
      case 'skill_analytics':
        data = await generateSkillAnalyticsReport(start, end);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const fileName = `${reportType}_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.json`;
    const fileSize = JSON.stringify(data).length;

    const report = await Report.create({
      reportType,
      generatedBy: req.user._id,
      dateRange: { startDate: start, endDate: end },
      data,
      fileName,
      fileSize
    });

    res.json({ message: 'Report generated successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download report
router.get('/reports/:reportId/download', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.downloadCount += 1;
    await report.save();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
    res.json(report.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get moderation logs
router.get('/moderation-logs', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, action, severity } = req.query;
    const query = {};
    
    if (action) query.action = action;
    if (severity) query.severity = severity;

    const logs = await ModerationLog.find(query)
      .populate('moderator', 'name')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ModerationLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions for report generation
async function generateUserActivityReport(startDate, endDate) {
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const activeUsers = await User.countDocuments({
    isActive: true,
    updatedAt: { $gte: startDate, $lte: endDate }
  });

  const usersByLocation = await User.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    summary: { newUsers, activeUsers },
    usersByLocation,
    generatedAt: new Date()
  };
}

async function generateSwapStatsReport(startDate, endDate) {
  const totalSwaps = await SwapRequest.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const swapsByStatus = await SwapRequest.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const popularSkills = await SwapRequest.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$requestedSkill', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return {
    summary: { totalSwaps },
    swapsByStatus,
    popularSkills,
    generatedAt: new Date()
  };
}

async function generateFeedbackLogsReport(startDate, endDate) {
  const ratings = await Rating.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('rater', 'name').populate('rated', 'name');

  const averageRating = await Rating.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const ratingDistribution = await Rating.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return {
    ratings,
    averageRating: averageRating[0]?.avgRating || 0,
    ratingDistribution,
    generatedAt: new Date()
  };
}

async function generateSkillAnalyticsReport(startDate, endDate) {
  const skillsOffered = await User.aggregate([
    { $unwind: '$skillsOffered' },
    { $group: { _id: '$skillsOffered.skill', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  const skillsWanted = await User.aggregate([
    { $unwind: '$skillsWanted' },
    { $group: { _id: '$skillsWanted.skill', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  return {
    skillsOffered,
    skillsWanted,
    generatedAt: new Date()
  };
}

module.exports = router;