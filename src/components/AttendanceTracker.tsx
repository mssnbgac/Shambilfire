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
import { searchStudents, getAllStudents, StudentSearchResult } from '@/lib/studentSearch';
import { getClasses } from '@/lib/classStorage';
import { 
  saveAttendanceRecord, 
  getAttendanceByDate, 
  calculateAttendanceStats,
  AttendanceRecord 
} from '@/lib/attendanceStorage';
import { searchUserByEmailUnified } from '@/lib/userManagement';

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
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState<StudentSearchResult[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<string[]>([]);

  useEffect(() => {
    loadTeacherClasses();
  }, [user]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, teacherClasses]);

  const loadTeacherClasses = () => {
    if (user?.role === 'teacher' && user?.email) {
      const teacherData = searchUserByEmailUnified(user.email);
      if (teacherData && teacherData.classAssignments) {
        setTeacherClasses(teacherData.classAssignments);
      }
    }
  };

  const loadAttendanceData = () => {
    setLoading(true);
    
    // Get all students
    let students = getAllStudents();
    
    // Filter by teacher's assigned classes if teacher
    if (user?.role === 'teacher' && teacherClasses.length > 0) {
      students = students.filter(student => 
        teacherClasses.some(className => 
          student.class.toLowerCase().includes(className.toLowerCase()) ||
          className.toLowerCase().includes(student.class.toLowerCase())
        )
      );
    }
    
    setAvailableStudents(students);
    
    // Load existing attendance records for selected date
    const existingRecords = getAttendanceByDate(selectedDate);
    
    // Create attendance records for all students
    const records: AttendanceRecord[] = students.map(student => {
      const existing = existingRecords.find(r => r.studentId === student.id);
      
      if (existing) {
        return existing;
      }
      
      // Create placeholder record
      return {
        id: `temp-${student.id}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        admissionNumber: student.admissionNumber,
        classId: student.class,
        className: student.class,
        date: selectedDate,
        status: 'absent' as const,
        markedBy: user?.id || '',
        markedByName: user ? `${user.firstName} ${user.lastName}` : '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    setAttendanceRecords(records);

    // Calculate stats (for the month)
    const monthStart = new Date(selectedDate);
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    
    const totalDays = 20; // Approximate school days per month
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    
    // Calculate from actual records
    students.forEach(student => {
      const studentStats = calculateAttendanceStats(student.id, monthStartStr, selectedDate);
      presentDays += studentStats.presentDays;
      absentDays += studentStats.absentDays;
      lateDays += studentStats.lateDays;
    });
    
    const avgPresent = students.length > 0 ? presentDays / students.length : 0;
    const avgAbsent = students.length > 0 ? absentDays / students.length : 0;
    const avgLate = students.length > 0 ? lateDays / students.length : 0;
    const attendanceRate = totalDays > 0 ? (avgPresent / totalDays) * 100 : 0;

    setStats({
      totalDays,
      presentDays: Math.round(avgPresent),
      absentDays: Math.round(avgAbsent),
      lateDays: Math.round(avgLate),
      attendanceRate
    });

    setLoading(false);
  };

  const updateAttendance = (recordId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    const record = attendanceRecords.find(r => r.id === recordId || r.studentId === recordId);
    
    if (!record) return;
    
    const timeIn = status === 'present' ? '08:15' : status === 'late' ? '08:45' : undefined;
    
    // Save to storage
    try {
      const savedRecord = saveAttendanceRecord({
        studentId: record.studentId,
        studentName: record.studentName,
        studentEmail: record.studentEmail,
        admissionNumber: record.admissionNumber,
        classId: record.classId,
        className: record.className,
        date: selectedDate,
        status,
        timeIn,
        timeOut: status === 'present' || status === 'late' ? '15:30' : undefined,
        markedBy: user?.id || '',
        markedByName: user ? `${user.firstName} ${user.lastName}` : ''
      });
      
      // Update local state
      setAttendanceRecords(prev => 
        prev.map(r => 
          r.studentId === record.studentId 
            ? savedRecord
            : r
        )
      );
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance record');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      loadAttendanceData();
      return;
    }
    
    // Search students by email or admission number
    const searchResults = searchStudents(term);
    
    // Filter by teacher's classes if teacher
    let filteredResults = searchResults;
    if (user?.role === 'teacher' && teacherClasses.length > 0) {
      filteredResults = searchResults.filter(student => 
        teacherClasses.some(className => 
          student.class.toLowerCase().includes(className.toLowerCase()) ||
          className.toLowerCase().includes(student.class.toLowerCase())
        )
      );
    }
    
    // Load existing attendance for these students
    const existingRecords = getAttendanceByDate(selectedDate);
    
    const records: AttendanceRecord[] = filteredResults.map(student => {
      const existing = existingRecords.find(r => r.studentId === student.id);
      
      if (existing) {
        return existing;
      }
      
      return {
        id: `temp-${student.id}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        admissionNumber: student.admissionNumber,
        classId: student.class,
        className: student.class,
        date: selectedDate,
        status: 'absent' as const,
        markedBy: user?.id || '',
        markedByName: user ? `${user.firstName} ${user.lastName}` : '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    setAttendanceRecords(records);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'late':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center space-x-4">
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
      </div>

      {/* Search Bar */}
      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search student by email or admission number..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          {teacherClasses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Your classes:</span>
              {teacherClasses.map((className, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {className}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{attendanceRecords.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Present Today</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length}
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
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Absent Today</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {attendanceRecords.filter(r => r.status === 'absent').length}
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
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.attendanceRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </h3>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  {user?.role === 'teacher' || user?.role === 'admin' ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {record.studentName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                          <div className="text-sm text-gray-500">{record.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.admissionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.timeIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.timeOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.notes || '-'}
                    </td>
                    {user?.role === 'teacher' || user?.role === 'admin' ? (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateAttendance(record.studentId, 'present')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark Present"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateAttendance(record.studentId, 'absent')}
                            className="text-red-600 hover:text-red-900"
                            title="Mark Absent"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateAttendance(record.studentId, 'late')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Mark Late"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Statistics</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalDays}</div>
              <div className="text-sm text-gray-500">Total School Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
              <div className="text-sm text-gray-500">Present Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
              <div className="text-sm text-gray-500">Absent Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
              <div className="text-sm text-gray-500">Late Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}