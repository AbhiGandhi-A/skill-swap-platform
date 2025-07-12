import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MessageSquare, CheckCircle, XCircle, Trash2, Clock, User, Award } from 'lucide-react';
import RatingModal from '../Ratings/RatingModal';

const SwapRequestsList = () => {
  const { user, token } = useAuth();
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRatingModal, setShowRatingModal] = useState({
    show: false,
    swapRequest: undefined,
    ratedUserId: undefined
  });

  const fetchSwapRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filter,
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:3001/api/swaps/my-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSwapRequests(data.swapRequests);
      }
    } catch (error) {
      console.error('Error fetching swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, [filter, statusFilter, token]);

  const updateSwapStatus = async (swapId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/swaps/${swapId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchSwapRequests();
      }
    } catch (error) {
      console.error('Error updating swap status:', error);
    }
  };

  const deleteSwapRequest = async (swapId) => {
    if (!confirm('Are you sure you want to delete this swap request?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/swaps/${swapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSwapRequests();
      }
    } catch (error) {
      console.error('Error deleting swap request:', error);
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

  const canRate = (swapRequest) => {
    return swapRequest.status === 'completed';
  };

  const getRatedUserId = (swapRequest) => {
    return swapRequest.requester._id === user?._id 
      ? swapRequest.recipient._id 
      : swapRequest.requester._id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Skill Swaps</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
            {['all', 'sent', 'received'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 font-medium capitalize ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {swapRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No swap requests found</h3>
          <p className="text-gray-500">Start by browsing skills and sending requests!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {swapRequests.map((swapRequest) => {
            const isRequester = swapRequest.requester._id === user?._id;
            const otherUser = isRequester ? swapRequest.recipient : swapRequest.requester;

            return (
              <div key={swapRequest._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {otherUser.profilePhoto ? (
                          <img
                            src={otherUser.profilePhoto}
                            alt={otherUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          otherUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {isRequester ? `Request to ${otherUser.name}` : `Request from ${otherUser.name}`}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(swapRequest.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swapRequest.status)}`}>
                      {swapRequest.status.charAt(0).toUpperCase() + swapRequest.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Skill Requested
                      </h4>
                      <p className="text-blue-800 font-semibold">{swapRequest.requestedSkill}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Skill Offered
                      </h4>
                      <p className="text-green-800 font-semibold">{swapRequest.offeredSkill}</p>
                    </div>
                  </div>

                  {swapRequest.message && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </h4>
                      <p className="text-gray-700">{swapRequest.message}</p>
                    </div>
                  )}

                  {(swapRequest.proposedDuration || swapRequest.proposedSchedule) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {swapRequest.proposedDuration && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Duration</h4>
                          <p className="text-gray-600">{swapRequest.proposedDuration}</p>
                        </div>
                      )}
                      {swapRequest.proposedSchedule && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Schedule</h4>
                          <p className="text-gray-600">{swapRequest.proposedSchedule}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {!isRequester && swapRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateSwapStatus(swapRequest._id, 'accepted')}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </button>
                        <button
                          onClick={() => updateSwapStatus(swapRequest._id, 'rejected')}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}

                    {swapRequest.status === 'accepted' && (
                      <button
                        onClick={() => updateSwapStatus(swapRequest._id, 'completed')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </button>
                    )}

                    {canRate(swapRequest) && (
                      <button
                        onClick={() => setShowRatingModal({
                          show: true,
                          swapRequest,
                          ratedUserId: getRatedUserId(swapRequest)
                        })}
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Rate User
                      </button>
                    )}

                    {isRequester && swapRequest.status === 'pending' && (
                      <button
                        onClick={() => deleteSwapRequest(swapRequest._id)}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showRatingModal.show && showRatingModal.swapRequest && showRatingModal.ratedUserId && (
        <RatingModal
          swapRequest={showRatingModal.swapRequest}
          ratedUserId={showRatingModal.ratedUserId}
          onClose={() => setShowRatingModal({ show: false })}
          onRated={() => {
            setShowRatingModal({ show: false });
            fetchSwapRequests();
          }}
        />
      )}
    </div>
  );
};

export default SwapRequestsList;