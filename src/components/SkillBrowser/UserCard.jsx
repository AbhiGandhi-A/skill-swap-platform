import React, { useState } from 'react';
import { MapPin, Star, Clock, Send, Award } from 'lucide-react';
import SwapRequestModal from '../SwapRequests/SwapRequestModal';

const UserCard = ({ user }) => {
  const [showSwapModal, setShowSwapModal] = useState(false);

  const getAvailabilityText = () => {
    const available = [];
    if (user.availability.weekdays) available.push('Weekdays');
    if (user.availability.weekends) available.push('Weekends');
    if (user.availability.evenings) available.push('Evenings');
    return available.length > 0 ? available.join(', ') : 'No availability set';
  };

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                {user.location && (
                  <p className="text-gray-600 text-sm flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {user.location}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {user.rating.average > 0 ? user.rating.average.toFixed(1) : 'New'}
              </span>
              {user.rating.count > 0 && (
                <span className="text-xs text-gray-500">({user.rating.count})</span>
              )}
            </div>
          </div>

          {/* Skills Offered */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-1 text-green-600" />
              Skills Offered
            </h4>
            <div className="space-y-2">
              {user.skillsOffered.slice(0, 2).map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 font-medium">{skill.skill}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(skill.experience)}`}>
                    {skill.experience}
                  </span>
                </div>
              ))}
              {user.skillsOffered.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{user.skillsOffered.length - 2} more skills
                </p>
              )}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-1 text-blue-600" />
              Skills Wanted
            </h4>
            <div className="space-y-2">
              {user.skillsWanted.slice(0, 2).map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 font-medium">{skill.skill}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(skill.urgency)}`}>
                    {skill.urgency}
                  </span>
                </div>
              ))}
              {user.skillsWanted.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{user.skillsWanted.length - 2} more skills
                </p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-purple-600" />
              Availability
            </h4>
            <p className="text-sm text-gray-600">{getAvailabilityText()}</p>
            <p className="text-xs text-gray-500">Timezone: {user.availability.timeZone}</p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowSwapModal(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Request Skill Swap
          </button>
        </div>
      </div>

      {showSwapModal && (
        <SwapRequestModal
          recipientUser={user}
          onClose={() => setShowSwapModal(false)}
        />
      )}
    </>
  );
};

export default UserCard;