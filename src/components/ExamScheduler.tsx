'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { NIGERIAN_CLASSES, NIGERIAN_SUBJECTS } from '@/types';
import { 
  getExamSchedules, 
  saveExamSchedule, 
  updateExamSchedule, 
  deleteExamSchedule, 
  initializeDemoExams,
  type ExamSchedule 
} from '@/lib/examStorage';
import { createNotification } from '@/lib/notificationSystem';
import { getAllStudents } from '@/lib/studentSearch';
import toast from 'react-hot-toast';

export default function ExamScheduler() {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    subject: string;
    class: string;
    date: string;
    time: string;
    duration: number;
    venue: string;
    examiner: string;
    type: 'midterm' | 'final' | 'quiz' | 'practical';
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  }>({
    subject: '',
    class: '',
    date: '',
    time: '',
    duration: 120,
    venue: '',
    examiner: '',
    type: 'midterm',
    status: 'scheduled'
  });

  useEffect(() => {
    loadExamSchedules();
    initializeDemoExams();
  }, []);

  const loadExamSchedules = () => {
    try {
      const schedules = getExamSchedules();
      setExams(schedules);
    } catch (error) {
      console.error('Error loading exam schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = () => {
    setEditingExam(null);
    setFormData({
      subject: '',
      class: '',
      date: '',
      time: '',
      duration: 120,
      venue: '',
      examiner: '',
      type: 'midterm',
      status: 'scheduled'
    });
    setShowForm(true);
  };

  const handleEditExam = (exam: ExamSchedule) => {
    setEditingExam(exam);
    setFormData({
      subject: exam.subject,
      class: exam.class,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      venue: exam.venue,
      examiner: exam.examiner,
      type: exam.type,
      status: exam.status
    });
    setShowForm(true);
  };

  const handleDeleteExam = (examId: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      const success = deleteExamSchedule(examId);
      if (success) {
        setExams(prev => prev.filter(exam => exam.id !== examId));
        
        // Trigger storage event for real-time updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'shambil_exams',
          newValue: JSON.stringify(getExamSchedules())
        }));
        
        toast.success('Exam deleted successfully');
      } else {
        toast.error('Failed to delete exam');
      }
    }
  };

  const notifyStudentsOfExam = (examData: any) => {
    try {
      const allStudents = getAllStudents();
      const classStudents = allStudents.filter(student => 
        student.class === examData.class ||
        student.class.replace(/\s+/g, '').toLowerCase() === examData.class.replace(/\s+/g, '').toLowerCase()
      );

      const examDate = new Date(examData.date).toLocaleDateString();
      
      classStudents.forEach(student => {
        createNotification({
          studentId: student.id,
          type: 'result', // Using 'result' type for exam notifications
          academicSession: '2024/2025',
          term: 'Current Term',
          message: `New exam scheduled: ${examData.subject} on ${examDate} at ${examData.time}. Venue: ${examData.venue}`
        });
      });

      toast.success(`Notified ${classStudents.length} students about the exam`);
    } catch (error) {
      console.error('Error notifying students:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.class || !formData.date || !formData.time || !formData.venue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingExam) {
        const success = updateExamSchedule(editingExam.id, formData);

        if (success) {
          setExams(prev => prev.map(exam =>
            exam.id === editingExam.id ? { ...exam, ...formData, updatedAt: new Date() } : exam
          ));
          
          // Notify students of exam update
          notifyStudentsOfExam(formData);
          toast.success('Exam updated successfully');
        } else {
          toast.error('Failed to update exam');
        }
      } else {
        const newExam = saveExamSchedule(formData);
        setExams(prev => [...prev, newExam]);
        
        // Notify students of new exam
        notifyStudentsOfExam(formData);
        toast.success(`${formData.subject} exam scheduled successfully`);
      }

      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'shambil_exams',
        newValue: JSON.stringify(getExamSchedules())
      }));
      
      setShowForm(false);
      setEditingExam(null);
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error('Failed to save exam');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ExamForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject *</label>
              <select 
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Subject</option>
                {NIGERIAN_SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <select 
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Class</option>
                {NIGERIAN_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                placeholder="120"
                min="30"
                max="300"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue *</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Exam Hall A"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Examiner</label>
              <input
                type="text"
                value={formData.examiner}
                onChange={(e) => handleInputChange('examiner', e.target.value)}
                placeholder="Teacher Name"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Type</label>
              <select 
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="quiz">Quiz</option>
                <option value="midterm">Mid-term Exam</option>
                <option value="final">Final Exam</option>
                <option value="practical">Practical</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingExam ? 'Update' : 'Schedule'} Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Scheduler</h2>
          <p className="text-gray-600">Manage and schedule examinations</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'exam_officer') && (
          <button
            onClick={handleAddExam}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Exam
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Exams</dt>
                  <dd className="text-lg font-medium text-gray-900">{exams.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {exams.filter(exam => exam.status === 'scheduled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {exams.filter(exam => exam.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(exams.map(exam => exam.class)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Scheduled Examinations</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            All scheduled exams across different classes and subjects
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject & Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {(user?.role === 'admin' || user?.role === 'exam_officer') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpenIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{exam.subject}</div>
                        <div className="text-sm text-gray-500">{exam.class}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(exam.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{exam.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{exam.venue}</div>
                    <div className="text-sm text-gray-500">{exam.duration} minutes</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {exam.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  {(user?.role === 'admin' || user?.role === 'exam_officer') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Exam"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Exam"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {exams.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Examinations Scheduled</h3>
            <p className="text-gray-500 mb-4">
              {(user?.role === 'admin' || user?.role === 'exam_officer') ? 
                'Click "Schedule Exam" to add your first examination.' : 
                'No examinations have been scheduled yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && <ExamForm />}
    </div>
  );
}