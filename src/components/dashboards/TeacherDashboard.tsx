'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BriefcaseIcon,
  EyeIcon,
  EyeSlashIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherStats {
  myClasses: number;
  myStudents: number;
  pendingGrades: number;
  unreadMessages: number;
  todayClasses: any[];
  recentActivities: any[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    myClasses: 0,
    myStudents: 0,
    pendingGrades: 0,
    unreadMessages: 0,
    todayClasses: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // Demo teacher data (in real app, this would come from the database)
  const teacherProfile = {
    teacherId: 'TCH001',
    academicSession: '2024/2025',
    subjects: ['Mathematics', 'Further Mathematics', 'Physics'],
    classes: ['JSS 2A', 'JSS 2B', 'SS 1Science', 'SS 3Science'],
    qualifications: 'B.Sc Mathematics, M.Ed Educational Technology, PGDE',
    experience: '8 years of teaching experience in secondary schools',
    employmentDate: '2020-09-15',
    phoneNumber: '+234 803 401 2480',
    address: '45, Dan Masani Street, Birnin Gwari, Kaduna State',
    dateOfBirth: '1985-03-15'
  };

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      // Fetch classes assigned to this teacher
      const classesQuery = query(collection(db, 'classes'), where('teacherId', '==', user?.id));
      const classesSnapshot = await getDocs(classesQuery);
      
      // Count total students in teacher's classes
      let totalStudents = 0;
      classesSnapshot.docs.forEach(doc => {
        const classData = doc.data();
        totalStudents += classData.students?.length || 0;
      });

      // Fetch pending grades (grades not yet submitted)
      const gradesQuery = query(
        collection(db, 'grades'), 
        where('teacherId', '==', user?.id),
        where('total', '==', 0) // Assuming 0 means not graded yet
      );
      const gradesSnapshot = await getDocs(gradesQuery);

      setStats({
        myClasses: classesSnapshot.size,
        myStudents: totalStudents,
        pendingGrades: gradesSnapshot.size,
        unreadMessages: 0, // This would be fetched from messages collection
        todayClasses: [], // This would be fetched from timetable
        recentActivities: []
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'My Classes',
      value: stats.myClasses,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      href: '/classes'
    },
    {
      name: 'My Students',
      value: stats.myStudents,
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      href: '/students'
    },
    {
      name: 'Pending Grades',
      value: stats.pendingGrades,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
      href: '/results'
    },
    {
      name: 'Messages',
      value: stats.unreadMessages,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      href: '/messages'
    }
  ];

  const todaySchedule = [
    { time: '8:00 AM', subject: 'Mathematics', class: 'JSS 2A', room: 'Room 101' },
    { time: '10:00 AM', subject: 'Physics', class: 'SS 3B', room: 'Lab 1' },
    { time: '12:00 PM', subject: 'Mathematics', class: 'SS 1A', room: 'Room 102' },
    { time: '2:00 PM', subject: 'Further Mathematics', class: 'SS 3A', room: 'Room 103' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName}! 👩‍🏫
              </h1>
              <p className="text-green-100 text-lg">
                Here's your teaching overview and latest updates
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                {showProfile ? <EyeSlashIcon className="h-5 w-5 mr-2" /> : <EyeIcon className="h-5 w-5 mr-2" />}
                {showProfile ? 'Hide Profile' : 'View Profile'}
              </button>
              <a
                href="/results"
                className="inline-flex items-center px-6 py-3 bg-blue-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                Enter Results
              </a>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Teacher Profile Section */}
      {showProfile && (
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <UserIcon className="h-6 w-6 mr-3" />
              My Profile Information
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-green-100 pb-3 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <UserIcon className="h-4 w-4 text-green-600" />
                  </div>
                  Personal Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Full Name</p>
                      <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone Number</p>
                      <p className="text-sm text-gray-600">{teacherProfile.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPinIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{teacherProfile.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                      <p className="text-sm text-gray-600">{new Date(teacherProfile.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-100 pb-3 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <BriefcaseIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  Professional Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Teacher ID</p>
                      <p className="text-sm text-gray-600">{teacherProfile.teacherId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Academic Session</p>
                      <p className="text-sm text-gray-600">{teacherProfile.academicSession}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Employment Date</p>
                      <p className="text-sm text-gray-600">{new Date(teacherProfile.employmentDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50/50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 mb-3">Subjects Teaching</p>
                    <div className="flex flex-wrap gap-2">
                      {teacherProfile.subjects.map((subject, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50/50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 mb-3">Classes Teaching</p>
                    <div className="flex flex-wrap gap-2">
                      {teacherProfile.classes.map((className, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                          {className}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualifications & Experience */}
              <div className="md:col-span-2 space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-purple-100 pb-3 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  Qualifications & Experience
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <AcademicCapIcon className="h-4 w-4 text-blue-600 mr-2" />
                      Qualifications
                    </p>
                    <p className="text-sm text-gray-700">{teacherProfile.qualifications}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <p className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <BriefcaseIcon className="h-4 w-4 text-green-600 mr-2" />
                      Teaching Experience
                    </p>
                    <p className="text-sm text-gray-700">{teacherProfile.experience}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={card.name} className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <BoltIcon className="h-6 w-6 mr-3" />
            Quick Actions
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-2xl border border-gray-200/50 hover:border-indigo-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <UserIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                  My Profile
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  View my complete information and qualifications.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full"></div>
            </button>

            <a href="/results" className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-2xl border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <ClipboardDocumentListIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Enter Results
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Input student grades and assessments for all subjects.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full"></div>
            </a>

            <a href="/students" className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-2xl border border-gray-200/50 hover:border-green-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <AcademicCapIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  View Students
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Manage your class students and track their progress.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-green-100/50 to-transparent rounded-full"></div>
            </a>

            <a href="/messages" className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-2xl border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  Messages
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Communicate with parents, students, and admin.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full"></div>
            </a>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Recent Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <CalendarIcon className="h-6 w-6 mr-3" />
              Today's Schedule
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {todaySchedule.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <ClockIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{schedule.subject}</p>
                      <p className="text-xs text-gray-600 mt-1">{schedule.class} • {schedule.room}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">{schedule.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <ClockIcon className="h-6 w-6 mr-3" />
              Recent Activities
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Submitted grades for JSS 2A Mathematics</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Replied to parent message</p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100/50">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Updated class attendance</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}