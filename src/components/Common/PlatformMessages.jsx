import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertTriangle, Info, Megaphone, Settings } from 'lucide-react';

const PlatformMessages = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [dismissedMessages, setDismissedMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messages', {
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

  const markAsRead = async (messageId) => {
    try {
      await fetch(`http://localhost:3001/api/messages/${messageId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const dismissMessage = (messageId) => {
    setDismissedMessages(prev => [...prev, messageId]);
    markAsRead(messageId);
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'maintenance': return Settings;
      case 'feature': return Info;
      default: return Megaphone;
    }
  };

  const getMessageColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const visibleMessages = messages.filter(message => 
    !dismissedMessages.includes(message._id)
  );

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      {visibleMessages.map((message) => {
        const Icon = getMessageIcon(message.type);
        return (
          <div
            key={message._id}
            className={`p-4 rounded-lg border shadow-lg ${getMessageColor(message.priority)} animate-slide-in`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{message.title}</h4>
                  <p className="text-sm opacity-90">{message.content}</p>
                  <p className="text-xs opacity-75 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissMessage(message._id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlatformMessages;