import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Send } from 'lucide-react';

const SwapRequestModal = ({ recipientUser, onClose }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    requestedSkill: '',
    offeredSkill: '',
    message: '',
    proposedDuration: '',
    proposedSchedule: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient: recipientUser._id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        onClose();
        // You might want to show a success message or refresh the parent component
      } else {
        setError(data.message || 'Failed to send swap request');
      }
    } catch (error) {
      setError('Error sending swap request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Request Skill Swap with {recipientUser.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requested Skill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill you want to learn
                </label>
                <select
                  value={formData.requestedSkill}
                  onChange={(e) => setFormData({ ...formData, requestedSkill: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a skill they offer</option>
                  {recipientUser.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill.skill}>
                      {skill.skill} ({skill.experience})
                    </option>
                  ))}
                </select>
              </div>

              {/* Offered Skill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill you can offer
                </label>
                <select
                  value={formData.offeredSkill}
                  onChange={(e) => setFormData({ ...formData, offeredSkill: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a skill you offer</option>
                  {user?.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill.skill}>
                      {skill.skill} ({skill.experience})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Introduce yourself and explain what you're looking for..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Duration
                </label>
                <input
                  type="text"
                  value={formData.proposedDuration}
                  onChange={(e) => setFormData({ ...formData, proposedDuration: e.target.value })}
                  placeholder="e.g., 1 hour per week for 4 weeks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Schedule
                </label>
                <input
                  type="text"
                  value={formData.proposedSchedule}
                  onChange={(e) => setFormData({ ...formData, proposedSchedule: e.target.value })}
                  placeholder="e.g., Saturday mornings"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal;