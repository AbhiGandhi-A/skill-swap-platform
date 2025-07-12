import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Star, Users, MessageSquare, Calendar, Award, TrendingUp, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSwaps: 0,
    completedSwaps: 0,
    pendingRequests: 0,
    averageRating: 0
  });

  // Mock stats for demo - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setStats({
      totalSwaps: 12,
      completedSwaps: 8,
      pendingRequests: 3,
      averageRating: user?.rating?.average || 0
    });
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Welcome to your SkillSwap dashboard. Ready to learn something new today?
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'recently'}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {user?.rating?.average ? `${user.rating.average.toFixed(1)} rating` : 'New member'}
                </div>
              </div>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Swaps</h3>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSwaps}</p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Completed</h3>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completedSwaps}</p>
            <p className="text-sm text-gray-500 mt-1">Successfully completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting response</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Rating</h3>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {user?.rating?.count ? `${user.rating.count} reviews` : 'No reviews yet'}
            </p>
          </div>
        </div>

        {/* Skills Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Offered */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Award className="w-6 h-6 mr-2 text-green-600" />
                Skills I Offer
              </h2>
              <span className="text-sm text-gray-500">
                {user?.skillsOffered?.length || 0} skills
              </span>
            </div>
            
            {user?.skillsOffered && user.skillsOffered.length > 0 ? (
              <div className="space-y-3">
                {user.skillsOffered.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-900">{skill.skill}</h4>
                      {skill.description && (
                        <p className="text-sm text-green-700">{skill.description}</p>
                      )}
                    </div>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      {skill.experience}
                    </span>
                  </div>
                ))}
                {user.skillsOffered.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{user.skillsOffered.length - 5} more skills
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No skills offered yet</p>
                <p className="text-sm text-gray-400">Add skills to start connecting with others</p>
              </div>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                Skills I Want to Learn
              </h2>
              <span className="text-sm text-gray-500">
                {user?.skillsWanted?.length || 0} skills
              </span>
            </div>
            
            {user?.skillsWanted && user.skillsWanted.length > 0 ? (
              <div className="space-y-3">
                {user.skillsWanted.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-900">{skill.skill}</h4>
                      {skill.description && (
                        <p className="text-sm text-blue-700">{skill.description}</p>
                      )}
                    </div>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      {skill.urgency}
                    </span>
                  </div>
                ))}
                {user.skillsWanted.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{user.skillsWanted.length - 5} more skills
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No learning goals set yet</p>
                <p className="text-sm text-gray-400">Add skills you want to learn</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <Users className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">
                Browse Skills
              </p>
              <p className="text-xs text-gray-500">Find people to learn from</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <MessageSquare className="w-8 h-8 text-gray-400 group-hover:text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">
                View Requests
              </p>
              <p className="text-xs text-gray-500">Check your swap requests</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <Award className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">
                Update Profile
              </p>
              <p className="text-xs text-gray-500">Manage your skills</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;