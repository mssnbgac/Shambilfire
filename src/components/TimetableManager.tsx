'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTimetableData, 
  addTimetableEntry, 
  updateTimetableEntry, 
  deleteTimetableEntry,
  initializeDemoTimetable,
  TimetableEntry
} from '@/lib/timetableStorage';
import { NIGERIAN_CLASSES, NIGERIAN_SUBJECTS } from '@/types';
import toast from 'react-hot-toast';

interface ClassSchedule {
  [key: string]: TimetableEntry[];
}

export default function TimetableManager() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('JSS 2A');
  const [selectedView, setSelectedView] = useState<'weekly' | 'daily'>('weekly');
  const [timetable, setTimetable] = useState<ClassSchedule>({});
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '08:00 - 08:40',
    '08:40 - 09:20',
    '09:20 - 10:00',
    '10:00 - 10:20', // Break
    '10:20 - 11:00',
    '11:00 - 11:40',
    '11:40 - 12:20',
    '12:20 - 13:00', // Lunch
    '13:00 - 13:40',
    '13:40 - 14:20',
    '14:20 - 15:00'
  ];

  const classes = NIGERIAN_CLASSES;

  useEffect(() => {
    loadTimetableData();
  }, [selectedClass]);

  // Initialize demo data only once when component mounts
  useEffect(() => {
    initializeDemoTimetable();
  }, []);

  const loadTimetableData = () => {
    try {
      // Get all timetable data
      const allTimetableData = getTimetableData();
      
      // Convert to the format expected by the component
      const formattedTimetable: ClassSchedule = {};
      
      Object.keys(allTimetableData).forEach(classId => {
        const classSchedule: TimetableEntry[] = [];
        const classTimetable = allTimetableData[classId];
        
        Object.keys(classTimetable).forEach(day => {
          Object.keys(classTimetable[day]).forEach(time => {
            classSchedule.push(classTimetable[day][time]);
          });
        });
        
        formattedTimetable[classId] = classSchedule;
      });
      
      setTimetable(formattedTimetable);
      setLoading(false);
    } catch (error) {
      console.error('Error loading timetable data:', error);
      setLoading(false);
    }
  };

  const getEntryForSlot = (day: string, time: string) => {
    const classSchedule = timetable[selectedClass] || [];
    return classSchedule.find(entry => entry.day === day && entry.time === time);
  };

  const isBreakTime = (time: string) => {
    return time === '10:00 - 10:20' || time === '12:20 - 13:00';
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'English Language': 'bg-green-100 text-green-800 border-green-200',
      'Physics': 'bg-purple-100 text-purple-800 border-purple-200',
      'Chemistry': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Biology': 'bg-pink-100 text-pink-800 border-pink-200',
      'History': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Geography': 'bg-red-100 text-red-800 border-red-200',
      'Civic Education': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleAddEntry = (day: string, time: string) => {
    setEditingEntry({
      id: '',
      day,
      time,
      subject: '',
      teacher: '',
      class: selectedClass,
      room: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setShowForm(true);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    // Find the entry to get its day and time
    const classSchedule = timetable[selectedClass] || [];
    const entryToDelete = classSchedule.find(entry => entry.id === entryId);
    
    if (entryToDelete) {
      // Delete from storage
      deleteTimetableEntry(selectedClass, entryToDelete.day, entryToDelete.time);
      
      // Update local state
      setTimetable(prev => ({
        ...prev,
        [selectedClass]: (prev[selectedClass] || []).filter(entry => entry.id !== entryId)
      }));
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'shambil_timetables',
        newValue: JSON.stringify(getTimetableData())
      }));
      
      toast.success('Timetable entry deleted successfully! Students will see the updated schedule immediately.');
    }
  };

  const handleFormSubmit = (formData: any) => {
    try {
      if (editingEntry?.id) {
        // Update existing entry
        const success = updateTimetableEntry(editingEntry.id, {
          subject: formData.subject,
          teacher: formData.teacher,
          room: formData.room
        });
        
        if (success) {
          // Reload data to reflect changes
          loadTimetableData();
        }
      } else {
        // Add new entry
        const newEntry = addTimetableEntry({
          day: editingEntry?.day || '',
          time: editingEntry?.time || '',
          subject: formData.subject,
          teacher: formData.teacher,
          class: selectedClass,
          room: formData.room
        });
        
        // Update local state
        setTimetable(prev => ({
          ...prev,
          [selectedClass]: [...(prev[selectedClass] || []), newEntry]
        }));
        
        // Trigger storage event for real-time updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'shambil_timetables',
          newValue: JSON.stringify(getTimetableData())
        }));
      }
      
      setShowForm(false);
      setEditingEntry(null);
      
      // Show success message
      const action = editingEntry ? 'updated' : 'added';
      toast.success(`Timetable entry ${action} successfully! Students will see the updated schedule immediately.`);
    } catch (error) {
      console.error('Error saving timetable entry:', error);
      toast.error('Failed to save timetable entry');
    }
  };

  const TimetableForm = () => {
    const [formData, setFormData] = useState({
      subject: editingEntry?.subject || '',
      teacher: editingEntry?.teacher || '',
      room: editingEntry?.room || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleFormSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingEntry?.id ? 'Edit Class' : 'Add Class'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select 
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Subject</option>
                {NIGERIAN_SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher</label>
              <select 
                value={formData.teacher}
                onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Teacher</option>
                <option value="Mr. Johnson">Mr. Johnson</option>
                <option value="Mrs. Smith">Mrs. Smith</option>
                <option value="Dr. Brown">Dr. Brown</option>
                <option value="Mrs. Davis">Mrs. Davis</option>
                <option value="Mr. Wilson">Mr. Wilson</option>
                <option value="Mr. Adams">Mr. Adams</option>
                <option value="Mrs. Taylor">Mrs. Taylor</option>
                <option value="Mr. Clark">Mr. Clark</option>
                <option value="Mrs. Chemical">Mrs. Chemical</option>
                <option value="Dr. Life">Dr. Life</option>
                <option value="Mr. Advanced">Mr. Advanced</option>
                <option value="Mr. Tech">Mr. Tech</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <input
                type="text"
                placeholder="Room 101"
                value={formData.room}
                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Day</label>
              <input
                type="text"
                value={editingEntry?.day}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="text"
                value={editingEntry?.time}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
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
                {editingEntry?.id ? 'Update' : 'Add'} Class
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Timetable Management</h2>
          <p className="text-gray-600">Manage class schedules and timetables</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setSelectedView('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                selectedView === 'weekly'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedView('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                selectedView === 'daily'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(timetable[selectedClass] || []).length}
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
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Daily Hours</dt>
                  <dd className="text-lg font-medium text-gray-900">7 hours</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Subjects</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set((timetable[selectedClass] || []).map(entry => entry.subject)).size}
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
                <UserIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Teachers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set((timetable[selectedClass] || []).map(entry => entry.teacher)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Weekly Timetable - {selectedClass}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Time
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(time => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                      {time}
                    </td>
                    {days.map(day => {
                      const entry = getEntryForSlot(day, time);
                      const isBreak = isBreakTime(time);
                      
                      return (
                        <td key={`${day}-${time}`} className="px-4 py-3 text-sm">
                          {isBreak ? (
                            <div className="text-center text-gray-500 italic">
                              {time === '10:00 - 10:20' ? 'Break' : 'Lunch'}
                            </div>
                          ) : entry ? (
                            <div className={`p-2 rounded-lg border ${getSubjectColor(entry.subject)}`}>
                              <div className="font-medium">{entry.subject}</div>
                              <div className="text-xs opacity-75">{entry.teacher}</div>
                              <div className="text-xs opacity-75 flex items-center mt-1">
                                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                {entry.room}
                              </div>
                              {(user?.role === 'admin' || user?.role === 'teacher') && (
                                <div className="flex justify-end space-x-1 mt-1">
                                  <button
                                    onClick={() => handleEditEntry(entry)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <PencilIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                              {(user?.role === 'admin' || user?.role === 'teacher') && (
                                <button
                                  onClick={() => handleAddEntry(day, time)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <PlusIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Subject Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from(new Set((timetable[selectedClass] || []).map(entry => entry.subject))).map(subject => (
              <div key={subject} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border ${getSubjectColor(subject)}`}></div>
                <span className="text-sm text-gray-700">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && <TimetableForm />}
    </div>
  );
}