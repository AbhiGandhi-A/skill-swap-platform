import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, MessageSquare, Star, Settings, Ban, CheckCircle, AlertTriangle,
  Download, Send, Eye, FileText, BarChart3, Shield, Clock, TrendingUp,
  UserX, MessageCircle, Award, Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
    completedSwaps: 0,
    totalRatings: 0,
    averageRating: 0
  });
  const [users, setUsers] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [moderationLogs, setModerationLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Message form state
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    type: 'announcement',
    priority: 'medium',
    expiresAt: ''
  });

  // Moderation form state
  const [moderationForm, setModerationForm] = useState({
    userId: '',
    reason: '',
    duration: 7
  });

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/admin/all?page=${currentPage}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSwaps = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/swaps?limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSwaps(data.swaps);
      }
    } catch (error) {
      console.error('Error fetching swaps:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchModerationLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/moderation-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModerationLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchAdminStats();

      switch (activeTab) {
        case 'users':
          await fetchUsers();
          break;
        case 'swaps':
          await fetchSwaps();
          break;
        case 'messages':
          await fetchMessages();
          break;
        case 'moderation':
          await fetchModerationLogs();
          break;
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab, currentPage, token]);

  const toggleUserStatus = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: moderationForm.reason || 'Administrative action',
          duration: moderationForm.duration
        })
      });

      if (response.ok) {
        fetchUsers();
        fetchModerationLogs();
        setModerationForm({ userId: '', reason: '', duration: 7 });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const moderateSkill = async (userId, skillType, skillIndex, reason) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/moderate/skills/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'reject_skill',
          skillType,
          skillIndex,
          reason
        })
      });

      if (response.ok) {
        fetchUsers();
        fetchModerationLogs();
      }
    } catch (error) {
      console.error('Error moderating skill:', error);
    }
  };

  const createPlatformMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageForm)
      });

      if (response.ok) {
        setMessageForm({
          title: '',
          content: '',
          type: 'announcement',
          priority: 'medium',
          expiresAt: ''
        });
        fetchMessages();
      }
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  const toggleMessageStatus = async (messageId, isActive) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const generateReport = async (reportType) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const response = await fetch('http://localhost:3001/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Download the report
        const downloadResponse = await fetch(`http://localhost:3001/api/admin/reports/${data.report._id}/download`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.report.fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'swaps', label: 'Swap Monitoring', icon: MessageSquare },
    { id: 'messages', label: 'Platform Messages', icon: MessageCircle },
    { id: 'moderation', label: 'Moderation Logs', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Comprehensive platform management and monitoring</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium transition-all ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-sm text-green-600">
                    {stats.activeUsers} active
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Swaps</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalSwaps}</p>
                  <p className="text-sm text-yellow-600">
                    {stats.pendingSwaps} pending
                  </p>
                </div>
                <MessageSquare className="w-12 h-12 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedSwaps}</p>
                  <p className="text-sm text-gray-500">
                    Success rate: {stats.totalSwaps > 0 ? Math.round((stats.completedSwaps / stats.totalSwaps) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">
                    {stats.totalRatings} total ratings
                  </p>
                </div>
                <Star className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => generateReport('user_activity')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Activity className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">
                  User Activity Report
                </p>
              </button>

              <button
                onClick={() => generateReport('swap_stats')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">
                  Swap Statistics
                </p>
              </button>

              <button
                onClick={() => generateReport('feedback_logs')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <Award className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">
                  Feedback Report
                </p>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <Send className="w-8 h-8 text-gray-400 group-hover:text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 group-hover:text-orange-700">
                  Send Message
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.location && (
                          <div className="text-xs text-gray-400">{user.location}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900 mb-1">
                          <strong>Offers:</strong> {user.skillsOffered.slice(0, 2).map(s => s.skill).join(', ')}
                          {user.skillsOffered.length > 2 && ' ...'}
                        </div>
                        <div className="text-gray-600">
                          <strong>Wants:</strong> {user.skillsWanted.slice(0, 2).map(s => s.skill).join(', ')}
                          {user.skillsWanted.length > 2 && ' ...'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                      >
                        {user.isActive ? (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-lg text-sm ${currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Swap Monitoring Tab */}
      {activeTab === 'swaps' && swaps && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Swap Request Monitoring</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {swaps.map((swap) => (
                  <tr key={swap._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {(swap?.requester?.name || 'N/A')} → {(swap?.recipient?.name || 'N/A')}
                        </div>
                        <div className="text-gray-500">
                          {(swap?.requester?.email || 'N/A')} | {(swap?.recipient?.email || 'N/A')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          <strong>Requested:</strong> {swap?.requestedSkill || 'N/A'}
                        </div>
                        <div className="text-gray-600">
                          <strong>Offered:</strong> {swap?.offeredSkill || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(swap?.status || '')}`}>
                        {swap?.status ? swap.status.charAt(0).toUpperCase() + swap.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {swap?.createdAt ? new Date(swap.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Platform Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-8">
          {/* Create Message Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Platform Message</h2>
            <form onSubmit={createPlatformMessage} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={messageForm.type}
                    onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="feature">Feature Update</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={messageForm.priority}
                    onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={messageForm.expiresAt}
                    onChange={(e) => setMessageForm({ ...messageForm, expiresAt: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Platform Message
              </button>
            </form>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Platform Messages</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message?._id || Math.random()} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{message?.title || 'Untitled'}</h3>

                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message?.priority)}`}
                        >
                          {message?.priority || 'Normal'}
                        </span>

                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${message?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {message?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-2">{message?.content || 'No content provided.'}</p>

                      <div className="text-sm text-gray-500">
                        Created by {message?.createdBy?.name || 'Unknown'} on{' '}
                        {message?.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'N/A'}
                        {message?.expiresAt && (
                          <span>
                            {' '}
                            • Expires: {new Date(message.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleMessageStatus(message?._id, !message?.isActive)}
                      className={`ml-4 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${message?.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      {message?.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Moderation Logs Tab */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Moderation Activity Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moderator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {moderationLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.moderator?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{log.targetUser?.name || 'Unknown'}</div>
                        <div className="text-gray-500">{log.targetUser?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{log.action?.replace('_', ' ')}</div>
                        <div className="text-gray-500">{log.reason || 'No reason provided'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => generateReport('user_activity')}
              className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <Activity className="w-12 h-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 group-hover:text-blue-700 mb-2">
                User Activity Report
              </h3>
              <p className="text-sm text-gray-500">
                New registrations, active users, and engagement metrics
              </p>
            </button>

            <button
              onClick={() => generateReport('swap_stats')}
              className="p-6 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <TrendingUp className="w-12 h-12 text-gray-400 group-hover:text-green-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 group-hover:text-green-700 mb-2">
                Swap Statistics
              </h3>
              <p className="text-sm text-gray-500">
                Swap completion rates, popular skills, and trends
              </p>
            </button>

            <button
              onClick={() => generateReport('feedback_logs')}
              className="p-6 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <Award className="w-12 h-12 text-gray-400 group-hover:text-purple-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 group-hover:text-purple-700 mb-2">
                Feedback Report
              </h3>
              <p className="text-sm text-gray-500">
                User ratings, reviews, and satisfaction metrics
              </p>
            </button>

            <button
              onClick={() => generateReport('skill_analytics')}
              className="p-6 border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <BarChart3 className="w-12 h-12 text-gray-400 group-hover:text-orange-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 group-hover:text-orange-700 mb-2">
                Skill Analytics
              </h3>
              <p className="text-sm text-gray-500">
                Most offered/wanted skills and market analysis
              </p>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;