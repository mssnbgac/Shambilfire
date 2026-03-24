'use client';

import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  admissionNumber: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  notes?: string;
  markedBy: string;
  markedByName: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export default function AttendanceTracker() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<string[]>([]);

  useEffect(() => {
    loadStudents();
  }, [user]);

  useEffect(() => {
    if (allStudents.length > 0 || user?.role === 'admin') {
      loadAttendanceData();
    }
  }, [selectedDate, allStudents]);

  const loadStudents = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return;
      const data = await res.json();
      let students = (data.users || []).filter((u: any) => u.role === 'student');

      // Filter by teacher's classes if teacher
      if (user?.role === 'teacher') {
        const classes: string[] = (user as any).classes || [];
        setTeacherClasses(classes);
        if (classes.length > 0) {
          students = students.filter((s: any) =>
            classes.some((c: string) =>
              (s.class || '').toLowerCase().includes(c.toLowerCase()) ||
              c.toLowerCase().includes((s.class || '').toLowerCase())
            )
          );
        }
      }

      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch existing attendance records for the selected date
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      const existingMap: Record<string, AttendanceRecord> = {};
      if (res.ok) {
        const data = await res.json();
        (data.records || []).forEach((r: AttendanceRecord) => {
          existingMap[r.studentId] = r;
        });
      }

      // Build records for all students
      const records: AttendanceRecord[] = allStudents.map(student => {
        if (existingMap[student.id]) return existingMap[student.id];
        return {
          id: `temp-${student.id}`,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          admissionNumber: student.admissionNumber || '',
          classId: student.class || '',
          className: student.class || '',
          date: selectedDate,
          status: 'absent' as const,
          markedBy: user?.id || '',
          markedByName: user ? `${user.firstName} ${user.lastName}` : '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setAttendanceRecords(records);

      // Calculate stats from records
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const total = records.length;
      setStats({
        totalDays: 20,
        presentDays: present,
        absentDays: absent,
        lateDays: late,
        attendanceRate: total > 0 ? (present / total) * 100 : 0,
      });
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    const record = attendanceRecords.find(r => r.studentId === studentId);
    if (!record) return;

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: record.studentId,
          studentName: record.studentName,
          studentEmail: record.studentEmail,
          admissionNumber: record.admissionNumber,
          classId: record.classId,
          className: record.className,
          date: selectedDate,
          status,
          timeIn: status === 'present' ? '08:15' : status === 'late' ? '08:45' : undefined,
          timeOut: (status === 'present' || status === 'late') ? '15:30' : undefined,
          markedBy: user?.id || '',
          markedByName: user ? `${user.firstName} ${user.lastName}` : '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(prev =>
          prev.map(r => r.studentId === studentId ? data.record : r)
        );
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance record');
    }
  };

  const filteredRecords = searchTerm
    ? attendanceRecords.filter(r =>
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : attendanceRecords;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'absent': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'late': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'excused': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default: return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Tracker</h2>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Search */}
      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student by name, email or admission number..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {teacherClasses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Your classes:</span>
              {teacherClasses.map((c, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{c}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: UserGroupIcon, label: 'Total Students', value: filteredRecords.length, color: 'text-blue-600' },
          { icon: CheckCircleIcon, label: 'Present Today', value: filteredRecords.filter(r => r.status === 'present' || r.status === 'late').length, color: 'text-green-600' },
          { icon: XCircleIcon, label: 'Absent Today', value: filteredRecords.filter(r => r.status === 'absent').length, color: 'text-red-600' },
          { icon: ChartBarIcon, label: 'Attendance Rate', value: `${stats.attendanceRate.toFixed(1)}%`, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500 truncate">{s.label}</dt>
                <dd className="text-lg font-medium text-gray-900">{s.value}</dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Attendance for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
          </h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Student', 'Admission No.', 'Class', 'Status', 'Time In', 'Time Out', 'Notes',
                    ...(user?.role === 'teacher' || user?.role === 'admin' ? ['Actions'] : [])
                  ].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {record.studentName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                          <div className="text-sm text-gray-500">{record.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.admissionNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.timeIn || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.timeOut || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.notes || '-'}</td>
                    {(user?.role === 'teacher' || user?.role === 'admin') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => updateAttendance(record.studentId, 'present')} className="text-green-600 hover:text-green-900" title="Mark Present">
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => updateAttendance(record.studentId, 'absent')} className="text-red-600 hover:text-red-900" title="Mark Absent">
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => updateAttendance(record.studentId, 'late')} className="text-yellow-600 hover:text-yellow-900" title="Mark Late">
                            <ClockIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
