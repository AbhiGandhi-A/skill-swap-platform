import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Star, Send } from 'lucide-react';

const RatingModal = ({ swapRequest, ratedUserId, onClose, onRated }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    feedback: '',
    skills: {
      communication: 0,
      reliability: 0,
      expertise: 0
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const ratedUser = swapRequest.requester._id === ratedUserId ? swapRequest.requester : swapRequest.recipient;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          swapRequestId: swapRequest._id,
          ratedUserId,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        onRated();
      } else {
        setError(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      setError('Error submitting rating');
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Rate {ratedUser.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Skill Swap Details:</p>
            <p className="text-sm">
              <strong>You learned:</strong> {
                swapRequest.requester._id === user?._id 
                  ? swapRequest.requestedSkill 
                  : swapRequest.offeredSkill
              }
            </p>
            <p className="text-sm">
              <strong>You taught:</strong> {
                swapRequest.requester._id === user?._id 
                  ? swapRequest.offeredSkill 
                  : swapRequest.requestedSkill
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating
              </label>
              <div className="flex justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`w-10 h-10 ${
                      star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600">
                {formData.rating > 0 && (
                  ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating - 1]
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Detailed Ratings
              </label>
              <div className="space-y-3">
                <StarRating
                  label="Communication"
                  value={formData.skills.communication}
                  onChange={(value) => setFormData({
                    ...formData,
                    skills: { ...formData.skills, communication: value }
                  })}
                />
                <StarRating
                  label="Reliability"
                  value={formData.skills.reliability}
                  onChange={(value) => setFormData({
                    ...formData,
                    skills: { ...formData.skills, reliability: value }
                  })}
                />
                <StarRating
                  label="Expertise"
                  value={formData.skills.expertise}
                  onChange={(value) => setFormData({
                    ...formData,
                    skills: { ...formData.skills, expertise: value }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                placeholder="Share your experience with this skill swap..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.feedback.length}/500 characters
              </p>
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
                disabled={isLoading || formData.rating === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                {isLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;