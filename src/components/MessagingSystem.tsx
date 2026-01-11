'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PaperAirplaneIcon, 
  InboxIcon, 
  PencilSquareIcon,
  EyeIcon,
  UserCircleIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  replyToId?: string; // For tracking reply chains
}

interface MessageFormData {
  receiverId: string;
  subject: string;
  content: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

// Message storage key for localStorage
const MESSAGES_STORAGE_KEY = 'shambil_messages';

// Helper functions for message storage
const getStoredMessages = (): Message[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      return messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt)
      }));
    }
  } catch (error) {
    console.error('Error reading messages from storage:', error);
  }
  return [];
};

const storeMessage = (message: Message): void => {
  if (typeof window === 'undefined') return;
  try {
    const existingMessages = getStoredMessages();
    const updatedMessages = [...existingMessages, message];
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
  } catch (error) {
    console.error('Error storing message:', error);
  }
};

const updateMessageReadStatus = (messageId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const messages = getStoredMessages();
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
  } catch (error) {
    console.error('Error updating message read status:', error);
  }
};

// Initialize demo messages if none exist
const initializeDemoMessages = (): void => {
  if (typeof window === 'undefined') return;
  
  const existingMessages = getStoredMessages();
  if (existingMessages.length === 0) {
    const demoMessages: Message[] = [
      {
        id: 'demo-msg-1',
        senderId: 'admin-1',
        senderName: 'John Administrator',
        receiverId: 'student-1',
        receiverName: 'David Smith',
        subject: 'Welcome to Shambil Pride Academy',
        content: 'Welcome to our school management system. Please feel free to reach out if you have any questions about your studies or school activities.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'demo-msg-2',
        senderId: 'teacher-1',
        senderName: 'Mary Johnson',
        receiverId: 'student-1',
        receiverName: 'David Smith',
        subject: 'Mathematics Class Schedule Update',
        content: 'There has been a change in the mathematics class schedule for next week. The Tuesday class has been moved to Wednesday at 10:00 AM. Please update your timetable accordingly.',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: 'demo-msg-3',
        senderId: 'exam-officer-1',
        senderName: 'Jennifer Davis',
        receiverId: 'student-1',
        receiverName: 'David Smith',
        subject: 'Upcoming Examination Notice',
        content: 'This is to inform you that the mid-term examinations will commence on March 15th, 2024. Please ensure you are well prepared and have all necessary materials ready.',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        id: 'demo-msg-4',
        senderId: 'admin-1',
        senderName: 'John Administrator',
        receiverId: 'exam-officer-1',
        receiverName: 'Jennifer Davis',
        subject: 'Exam Schedule Coordination',
        content: 'Please coordinate with the teachers to finalize the examination schedule for the upcoming mid-term exams. The schedule should be ready by next Friday.',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      }
    ];

    // Store each demo message
    demoMessages.forEach(msg => {
      storeMessage(msg);
    });
  }
};

export default function MessagingSystem() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MessageFormData>();
  const { register: registerReply, handleSubmit: handleSubmitReply, reset: resetReply, formState: { errors: replyErrors } } = useForm<MessageFormData>();

  useEffect(() => {
    // Initialize demo messages on first load
    initializeDemoMessages();
    
    if (user) {
      fetchMessages();
      fetchUsers();
    }
  }, [user, activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Get all messages from localStorage
      const allMessages = getStoredMessages();
      
      // Filter messages based on active tab
      let filteredMessages: Message[] = [];
      
      if (activeTab === 'inbox') {
        // Show messages received by current user
        filteredMessages = allMessages.filter(msg => msg.receiverId === user?.id);
      } else {
        // Show messages sent by current user
        filteredMessages = allMessages.filter(msg => msg.senderId === user?.id);
      }

      // Sort by creation date (newest first)
      filteredMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // In demo mode, use predefined users instead of Firebase
      const demoUsers: User[] = [
        {
          id: 'admin-1',
          firstName: 'John',
          lastName: 'Administrator',
          role: 'admin',
          email: 'admin@shambil.edu.ng'
        },
        {
          id: 'teacher-1',
          firstName: 'Mary',
          lastName: 'Johnson',
          role: 'teacher',
          email: 'teacher@shambil.edu.ng'
        },
        {
          id: 'teacher-2',
          firstName: 'Michael',
          lastName: 'Brown',
          role: 'teacher',
          email: 'michael.brown@shambil.edu.ng'
        },
        {
          id: 'parent-1',
          firstName: 'Sarah',
          lastName: 'Wilson',
          role: 'parent',
          email: 'parent@shambil.edu.ng'
        },
        {
          id: 'parent-2',
          firstName: 'Mary',
          lastName: 'Davis',
          role: 'parent',
          email: 'mary.davis@gmail.com'
        },
        {
          id: 'exam-officer-1',
          firstName: 'Jennifer',
          lastName: 'Davis',
          role: 'exam_officer',
          email: 'examofficer@shambil.edu.ng'
        },
        {
          id: 'accountant-1',
          firstName: 'Lisa',
          lastName: 'Garcia',
          role: 'accountant',
          email: 'accountant@shambil.edu.ng'
        },
        {
          id: 'student-1',
          firstName: 'David',
          lastName: 'Smith',
          role: 'student',
          email: 'student@shambil.edu.ng'
        }
      ];

      // Filter users based on current user's role
      let filteredUsers: User[] = [];
      
      if (user?.role === 'admin') {
        // Admin can message everyone except themselves
        filteredUsers = demoUsers.filter(u => u.id !== user.id);
      } else if (user?.role === 'parent') {
        // Parents can ONLY message admins (as per requirement)
        filteredUsers = demoUsers.filter(u => u.role === 'admin');
      } else if (user?.role === 'teacher') {
        // Teachers can message admin, parents, exam officers, and students
        filteredUsers = demoUsers.filter(u => 
          ['admin', 'parent', 'exam_officer', 'student'].includes(u.role)
        );
      } else if (user?.role === 'exam_officer') {
        // Exam officers can message admin, teachers, parents, students, and other exam officers
        filteredUsers = demoUsers.filter(u => 
          ['admin', 'teacher', 'parent', 'student', 'exam_officer'].includes(u.role) && u.id !== user.id
        );
      } else if (user?.role === 'accountant') {
        // Accountants can message admin, parents, and students
        filteredUsers = demoUsers.filter(u => 
          ['admin', 'parent', 'student'].includes(u.role)
        );
      } else {
        // Students and others can message admin, teachers, and exam officers
        filteredUsers = demoUsers.filter(u => 
          ['admin', 'teacher', 'exam_officer'].includes(u.role)
        );
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      // Update in localStorage
      updateMessageReadStatus(messageId);
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const onSubmit = async (data: MessageFormData) => {
    try {
      const receiver = users.find(u => u.id === data.receiverId);
      if (!receiver) {
        toast.error('Invalid recipient');
        return;
      }

      // Create new message
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: user?.id || '',
        senderName: `${user?.firstName} ${user?.lastName}`,
        receiverId: data.receiverId,
        receiverName: `${receiver.firstName} ${receiver.lastName}`,
        subject: data.subject,
        content: data.content,
        isRead: false,
        createdAt: new Date()
      };

      // Store the message
      storeMessage(newMessage);

      // Add to sent messages if we're viewing sent tab
      if (activeTab === 'sent') {
        setMessages(prev => [newMessage, ...prev]);
      }

      toast.success('Message sent successfully!');
      reset();
      setShowCompose(false);
      
      // Refresh messages to show the new message
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const onReply = async (data: MessageFormData) => {
    try {
      if (!replyToMessage) {
        toast.error('No message to reply to');
        return;
      }

      // Create reply message
      const replyMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: user?.id || '',
        senderName: `${user?.firstName} ${user?.lastName}`,
        receiverId: replyToMessage.senderId,
        receiverName: replyToMessage.senderName,
        subject: replyToMessage.subject.startsWith('Re: ') ? replyToMessage.subject : `Re: ${replyToMessage.subject}`,
        content: data.content,
        isRead: false,
        createdAt: new Date(),
        replyToId: replyToMessage.id
      };

      // Store the reply
      storeMessage(replyMessage);

      toast.success('Reply sent successfully!');
      resetReply();
      setShowReply(false);
      setReplyToMessage(null);
      
      // Refresh messages to show the new reply
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    setShowReply(true);
    setSelectedMessage(null);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead && message.receiverId === user?.id) {
      markAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3" />
            Messages
          </h3>
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20 hover:border-white/40 transform hover:-translate-y-0.5"
          >
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            Compose
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Tabs */}
        <div className="border-b border-gray-200/50 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'inbox'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <InboxIcon className="h-5 w-5 mr-2" />
                <span>Inbox</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === 'inbox' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {messages.filter(m => m.receiverId === user?.id).length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                <span>Sent</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {messages.filter(m => m.senderId === user?.id).length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                  !message.isRead && message.receiverId === user?.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
                onClick={() => handleViewMessage(message)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activeTab === 'inbox' ? message.senderName : message.receiverName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activeTab === 'inbox' ? 'From' : 'To'}: {activeTab === 'inbox' ? message.senderName : message.receiverName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {message.createdAt.toLocaleDateString()} {message.createdAt.toLocaleTimeString()}
                    </p>
                    {!message.isRead && message.receiverId === user?.id && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                  <p className="text-sm text-gray-600 truncate">{message.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">From:</p>
                  <p className="text-sm text-gray-900">{selectedMessage.senderName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">To:</p>
                  <p className="text-sm text-gray-900">{selectedMessage.receiverName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Subject:</p>
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date:</p>
                  <p className="text-sm text-gray-900">
                    {selectedMessage.createdAt.toLocaleDateString()} {selectedMessage.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Message:</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
              </div>

              {/* Reply Button - Only show for received messages */}
              {selectedMessage.receiverId === user?.id && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleReply(selectedMessage)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Compose Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">To</label>
                  <select
                    {...register('receiverId', { required: 'Please select a recipient' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select recipient...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </option>
                    ))}
                  </select>
                  {errors.receiverId && (
                    <p className="mt-1 text-sm text-red-600">{errors.receiverId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    {...register('subject', { required: 'Subject is required' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subject..."
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    {...register('content', { required: 'Message content is required' })}
                    rows={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your message..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReply && replyToMessage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reply to Message</h3>
                <button
                  onClick={() => {
                    setShowReply(false);
                    setReplyToMessage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Original Message Context */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-700">Original Message:</p>
                <p className="text-sm text-gray-900 font-medium">{replyToMessage.subject}</p>
                <p className="text-sm text-gray-600">From: {replyToMessage.senderName}</p>
                <p className="text-sm text-gray-600 mt-1 truncate">{replyToMessage.content}</p>
              </div>
              
              <form onSubmit={handleSubmitReply(onReply)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reply Message</label>
                  <textarea
                    {...registerReply('content', { required: 'Reply content is required' })}
                    rows={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your reply..."
                  />
                  {replyErrors.content && (
                    <p className="mt-1 text-sm text-red-600">{replyErrors.content.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReply(false);
                      setReplyToMessage(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}