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
  BuildingOfficeIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTimetableData,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  initializeDemoTimetable,
  TimetableEntry,
} from '@/lib/timetableStorage';
import { NIGERIAN_CLASSES, NIGERIAN_SUBJECTS } from '@/types';
import toast from 'react-hot-toast';

interface ClassSchedule {
  [key: string]: TimetableEntry[];
}

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'bg-blue-50 text-blue-800 border-blue-200',
  'English Language': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Physics': 'bg-violet-50 text-violet-800 border-violet-200',
  'Chemistry': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Biology': 'bg-pink-50 text-pink-800 border-pink-200',
  'History': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Geography': 'bg-red-50 text-red-800 border-red-200',
  'Civic Education': 'bg-gray-100 text-gray-800 border-gray-200',
  'Computer Studies': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  'Further Mathematics': 'bg-orange-50 text-orange-800 border-orange-200',
};

const getSubjectColor = (subject: string) =>
  SUBJECT_COLORS[subject] || 'bg-gray-100 text-gray-700 border-gray-200';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00 - 08:40',
  '08:40 - 09:20',
  '09:20 - 10:00',
  '10:00 - 10:40',
  '10:40 - 11:20',
  '11:20 - 12:00',
  '12:00 - 12:40',
  '12:40 - 13:20',
  '13:20 - 14:00',
  '14:00 - 14:40',
  '14:40 - 15:20',
];
const BREAK_SLOTS = new Set(['10:00 - 10:40', '12:40 - 13:20']);

export default function TimetableManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedClass, setSelectedClass] = useState('JSS 2A');
  const [timetable, setTimetable] = useState<ClassSchedule>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [pendingSlot, setPendingSlot] = useState<{ day: string; time: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    initializeDemoTimetable();
  }, []);

  useEffect(() => {
    loadTimetableData();
  }, [selectedClass]);

  const loadTimetableData = () => {
    try {
      const raw = getTimetableData();
      const formatted: ClassSchedule = {};
      Object.keys(raw).forEach((cls) => {
        const entries: TimetableEntry[] = [];
        Object.keys(raw[cls]).forEach((day) => {
          Object.keys(raw[cls][day]).forEach((time) => {
            entries.push(raw[cls][day][time]);
          });
        });
        formatted[cls] = entries;
      });
      setTimetable(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = (day: string, time: string) =>
    (timetable[selectedClass] || []).find((e) => e.day === day && e.time === time);

  const handleAdd = (day: string, time: string) => {
    setPendingSlot({ day, time });
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setPendingSlot(null);
    setShowForm(true);
  };

  const handleDelete = (entry: TimetableEntry) => {
    setDeleteConfirm(entry.id);
  };

  const confirmDelete = (entry: TimetableEntry) => {
    deleteTimetableEntry(selectedClass, entry.day, entry.time);
    setTimetable((prev) => ({
      ...prev,
      [selectedClass]: (prev[selectedClass] || []).filter((e) => e.id !== entry.id),
    }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'shambil_timetables' }));
    toast.success('Entry deleted');
    setDeleteConfirm(null);
  };

  const handleFormSubmit = (formData: { subject: string; teacher: string; room: string }) => {
    try {
      if (editingEntry?.id) {
        updateTimetableEntry(editingEntry.id, formData);
        loadTimetableData();
        toast.success('Entry updated');
      } else if (pendingSlot) {
        const newEntry = addTimetableEntry({
          day: pendingSlot.day,
          time: pendingSlot.time,
          subject: formData.subject,
          teacher: formData.teacher,
          class: selectedClass,
          room: formData.room,
        });
        setTimetable((prev) => ({
          ...prev,
          [selectedClass]: [...(prev[selectedClass] || []), newEntry],
        }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'shambil_timetables' }));
        toast.success('Entry added');
      }
      setShowForm(false);
      setEditingEntry(null);
      setPendingSlot(null);
    } catch (err) {
      toast.error('Failed to save entry');
    }
  };

  const classEntries = timetable[selectedClass] || [];
  const uniqueSubjects = [...new Set(classEntries.map((e) => e.subject))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-400 text-sm">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timetable</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {isAdmin ? 'Manage class schedules — click + to add, pencil to edit, trash to delete.' : 'View class schedules.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {NIGERIAN_CLASSES.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Periods', value: classEntries.length, icon: CalendarIcon, color: 'bg-blue-100 text-blue-600' },
          { label: 'Daily Hours', value: '7 hrs', icon: ClockIcon, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Subjects', value: uniqueSubjects.length, icon: BookOpenIcon, color: 'bg-violet-100 text-violet-600' },
          { label: 'Teachers', value: new Set(classEntries.map((e) => e.teacher)).size, icon: UserIcon, color: 'bg-orange-100 text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Weekly Schedule — {selectedClass}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TIME_SLOTS.map((time) => {
                const isBreak = BREAK_SLOTS.has(time);
                return (
                  <tr key={time} className={isBreak ? 'bg-amber-50/50' : 'hover:bg-gray-50/50'}>
                    <td className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50/80 whitespace-nowrap">
                      {time}
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-2 py-2">
                          {isBreak ? (
                            <div className="text-center text-xs text-amber-600 font-medium py-2">
                              {time === '10:00 - 10:40' ? '☕ Break' : '🍽 Lunch'}
                            </div>
                          ) : entry ? (
                            <div className={`relative group rounded-xl border p-2.5 ${getSubjectColor(entry.subject)}`}>
                              <p className="font-semibold text-xs leading-tight">{entry.subject}</p>
                              <p className="text-xs opacity-70 mt-0.5">{entry.teacher}</p>
                              <div className="flex items-center gap-1 mt-1 opacity-60">
                                <BuildingOfficeIcon className="h-3 w-3" />
                                <span className="text-xs">{entry.room}</span>
                              </div>
                              {/* Admin-only controls */}
                              {isAdmin && (
                                <div className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-1">
                                  <button
                                    onClick={() => handleEdit(entry)}
                                    className="w-6 h-6 bg-white rounded-lg shadow flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Edit"
                                  >
                                    <PencilIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry)}
                                    className="w-6 h-6 bg-white rounded-lg shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              {/* Delete confirm inline */}
                              {deleteConfirm === entry.id && (
                                <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-1 z-10 p-2">
                                  <p className="text-xs font-semibold text-gray-700 text-center">Delete?</p>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => confirmDelete(entry)}
                                      className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                              {isAdmin && (
                                <button
                                  onClick={() => handleAdd(day, time)}
                                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-400 flex items-center justify-center transition-colors"
                                  title="Add class"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Legend */}
      {uniqueSubjects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Subject Legend</p>
          <div className="flex flex-wrap gap-2">
            {uniqueSubjects.map((subject) => (
              <span key={subject} className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${getSubjectColor(subject)}`}>
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <TimetableForm
          editingEntry={editingEntry}
          pendingSlot={pendingSlot}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingEntry(null); setPendingSlot(null); }}
        />
      )}
    </div>
  );
}

// ── Form Modal ──────────────────────────────────────────────────────────────
function TimetableForm({
  editingEntry,
  pendingSlot,
  onSubmit,
  onClose,
}: {
  editingEntry: TimetableEntry | null;
  pendingSlot: { day: string; time: string } | null;
  onSubmit: (data: { subject: string; teacher: string; room: string }) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    subject: editingEntry?.subject || '',
    teacher: editingEntry?.teacher || '',
    room: editingEntry?.room || '',
  });
  const [teachers, setTeachers] = useState<string[]>([]);

  const day = editingEntry?.day || pendingSlot?.day || '';
  const time = editingEntry?.time || pendingSlot?.time || '';
  const isEdit = !!editingEntry?.id;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('created_users');
      const fallback = ['Mr. Johnson', 'Mrs. Smith', 'Dr. Brown', 'Mrs. Davis', 'Mr. Wilson', 'Mr. Adams'];
      if (stored) {
        const users = JSON.parse(stored);
        const real = users.filter((u: any) => u.role === 'teacher').map((u: any) => `${u.firstName} ${u.lastName}`);
        setTeachers([...new Set([...real, ...fallback])]);
      } else {
        setTeachers(fallback);
      }
    } catch {
      setTeachers(['Mr. Johnson', 'Mrs. Smith', 'Dr. Brown', 'Mrs. Davis']);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Class' : 'Add Class'}</h3>
            <p className="text-blue-200 text-sm mt-0.5">{day} · {time}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select subject...</option>
              {NIGERIAN_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select
              value={formData.teacher}
              onChange={(e) => setFormData((p) => ({ ...p, teacher: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room / Venue</label>
            <input
              type="text"
              placeholder="e.g. Room 101, Lab 2"
              value={formData.room}
              onChange={(e) => setFormData((p) => ({ ...p, room: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400">Day</p>
              <p className="text-sm font-semibold text-gray-800">{day}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400">Time</p>
              <p className="text-sm font-semibold text-gray-800">{time}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckIcon className="h-4 w-4" />
              {isEdit ? 'Update' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
