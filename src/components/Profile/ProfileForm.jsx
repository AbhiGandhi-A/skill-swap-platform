import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, Plus, X, MapPin, Globe, Lock } from 'lucide-react';

const ProfileForm = () => {
  const { user, token, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    profilePhoto: '',
    skillsOffered: [{ skill: '', description: '', experience: 'Beginner' }],
    skillsWanted: [{ skill: '', description: '', urgency: 'Medium' }],
    availability: {
      weekdays: false,
      weekends: false,
      evenings: false,
      timeZone: 'UTC'
    },
    isPublic: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        profilePhoto: user.profilePhoto || '',
        skillsOffered: user.skillsOffered.length > 0 ? user.skillsOffered : [{ skill: '', description: '', experience: 'Beginner' }],
        skillsWanted: user.skillsWanted.length > 0 ? user.skillsWanted : [{ skill: '', description: '', urgency: 'Medium' }],
        availability: user.availability || { weekdays: false, weekends: false, evenings: false, timeZone: 'UTC' },
        isPublic: user.isPublic ?? true
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkillOffered = () => {
    setFormData({
      ...formData,
      skillsOffered: [...formData.skillsOffered, { skill: '', description: '', experience: 'Beginner' }]
    });
  };

  const removeSkillOffered = (index) => {
    setFormData({
      ...formData,
      skillsOffered: formData.skillsOffered.filter((_, i) => i !== index)
    });
  };

  const addSkillWanted = () => {
    setFormData({
      ...formData,
      skillsWanted: [...formData.skillsWanted, { skill: '', description: '', urgency: 'Medium' }]
    });
  };

  const removeSkillWanted = (index) => {
    setFormData({
      ...formData,
      skillsWanted: formData.skillsWanted.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-2">Manage your profile and skills</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country (optional)"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo URL
            </label>
            <input
              type="url"
              value={formData.profilePhoto}
              onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {formData.isPublic ? (
                  <><Globe className="inline w-4 h-4 mr-1" />Make profile public</>
                ) : (
                  <><Lock className="inline w-4 h-4 mr-1" />Keep profile private</>
                )}
              </span>
            </label>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Skills I Can Offer</h3>
            <button
              type="button"
              onClick={addSkillOffered}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </button>
          </div>
          
          {formData.skillsOffered.map((skill, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-white rounded-lg">
              <input
                type="text"
                placeholder="Skill name"
                value={skill.skill}
                onChange={(e) => {
                  const updated = [...formData.skillsOffered];
                  updated[index].skill = e.target.value;
                  setFormData({ ...formData, skillsOffered: updated });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={skill.description}
                onChange={(e) => {
                  const updated = [...formData.skillsOffered];
                  updated[index].description = e.target.value;
                  setFormData({ ...formData, skillsOffered: updated });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={skill.experience}
                onChange={(e) => {
                  const updated = [...formData.skillsOffered];
                  updated[index].experience = e.target.value;
                  setFormData({ ...formData, skillsOffered: updated });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={() => removeSkillOffered(index)}
                className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                disabled={formData.skillsOffered.length === 1}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Skills Wanted */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Skills I Want to Learn</h3>
            <button
              type="button"
              onClick={addSkillWanted}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </button>
          </div>
          
          {formData.skillsWanted.map((skill, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-white rounded-lg">
              <input
                type="text"
                placeholder="Skill name"
                value={skill.skill}
                onChange={(e) => {
                  const updated = [...formData.skillsWanted];
                  updated[index].skill = e.target.value;
                  setFormData({ ...formData, skillsWanted: updated });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={skill.description}
                onChange={(e) => {
                  const updated = [...formData.skillsWanted];
                  updated[index].description = e.target.value;
                  setFormData({ ...formData, skillsWanted: updated });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={skill.urgency}
                onChange={(e) => {
                  const updated = [...formData.skillsWanted];
                  updated[index].urgency = e.target.value;
                  setFormData({ ...formData, skillsWanted: updated });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <button
                type="button"
                onClick={() => removeSkillWanted(index)}
                className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                disabled={formData.skillsWanted.length === 1}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.availability.weekdays}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, weekdays: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Weekdays</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.availability.weekends}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, weekends: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Weekends</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.availability.evenings}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, evenings: e.target.checked }
                  })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Evenings</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone
              </label>
              <select
                value={formData.availability.timeZone}
                onChange={(e) => setFormData({
                  ...formData,
                  availability: { ...formData.availability, timeZone: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="GMT">GMT</option>
                <option value="IST">IST</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? 'Updating Profile...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;