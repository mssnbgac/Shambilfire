'use client';

import { useState, useEffect } from 'react';
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
  BoltIcon,
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { searchUserByEmailUnified, getAllUsersUnified } from '@/lib/userManagement';

interface TeacherProfile {
  teacherId: string;
  academicSession: string;
  subjects: string[];
  classes: string[];
  qualifications: string;
  experience: string;
  employmentDate: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
}

const SUBJECT_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-violet-600',
];

const CLASS_COLORS = [
  'border-l-violet-500 bg-violet-50',
  'border-l-blue-500 bg-blue-50',
  'border-l-emerald-500 bg-emerald-50',
  'border-l-orange-500 bg-orange-50',
  'border-l-rose-500 bg-rose-50',
  'border-l-cyan-500 bg-cyan-50',
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>({
    teacherId: '',
    academicSession: '2024/2025',
    subjects: [],
    classes: [],
    qualifications: 'Not specified',
    experience: 'Not specified',
    employmentDate: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    if (user) fetchTeacherData();
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      // Try API first
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(user?.email || '')}`);
        if (res.ok) {
          const data = await res.json();
          const apiUser = data.users?.find((u: any) => u.email === user?.email && u.role === 'teacher');
          if (apiUser) {
            setTeacherProfile({
              teacherId: apiUser.id,
              academicSession: apiUser.academicSession || '2024/2025',
              subjects: apiUser.subjects || [],
              classes: apiUser.classes || [],
              qualifications: apiUser.qualifications || 'Not specified',
              experience: apiUser.experience || 'Not specified',
              employmentDate: apiUser.employmentDate || '',
              phoneNumber: apiUser.phoneNumber || '',
              address: apiUser.address || '',
              dateOfBirth: apiUser.dateOfBirth || '',
            });
            setLoading(false);
            return;
          }
        }
      } catch (_) {}

      // Fallback to localStorage
      if (user?.email) {
        const td = searchUserByEmailUnified(user.email);
        if (td && td.role === 'teacher') {
          setTeacherProfile({
            teacherId: td.id,
            academicSession: (td as any).academicSession || '2024/2025',
            subjects: (td as any).subjects || [],
            classes: (td as any).classes || [],
            qualifications: (td as any).qualifications || 'Not specified',
            experience: (td as any).experience || 'Not specified',
            employmentDate: (td as any).employmentDate || '',
            phoneNumber: td.phoneNumber || '',
            address: td.address || '',
            dateOfBirth: td.dateOfBirth || '',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-2xl">
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl"></div>

        <div className="relative px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: avatar + greeting */}
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="h-4 w-4 text-yellow-300" />
                  <span className="text-indigo-200 text-sm font-medium">Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening'}</span>
                </div>
                <h1 className="text-3xl font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-indigo-200 text-sm mt-1 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dateStr}
                </p>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-xl hover:bg-white/25 transition-all duration-200 border border-white/20 text-sm font-medium"
              >
                <UserIcon className="h-4 w-4" />
                {showProfile ? 'Hide Profile' : 'My Profile'}
              </button>
              <a
                href="/results"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg text-sm font-semibold"
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
                Enter Results
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Subjects', value: teacherProfile.subjects.length, icon: BookOpenIcon, color: 'text-violet-200' },
              { label: 'Classes', value: teacherProfile.classes.length, icon: AcademicCapIcon, color: 'text-blue-200' },
              { label: 'Session', value: teacherProfile.academicSession, icon: CalendarIcon, color: 'text-emerald-200' },
              { label: 'Experience', value: teacherProfile.experience !== 'Not specified' ? teacherProfile.experience : '—', icon: StarIcon, color: 'text-yellow-200' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROFILE PANEL ── */}
      {showProfile && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <UserIcon className="h-5 w-5" />
              Profile Information
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Personal</h4>
              {[
                { icon: UserIcon, label: 'Full Name', value: `${user?.firstName} ${user?.lastName}`, color: 'bg-indigo-100 text-indigo-600' },
                { icon: EnvelopeIcon, label: 'Email', value: user?.email || '—', color: 'bg-blue-100 text-blue-600' },
                { icon: PhoneIcon, label: 'Phone', value: teacherProfile.phoneNumber || '—', color: 'bg-violet-100 text-violet-600' },
                { icon: MapPinIcon, label: 'Address', value: teacherProfile.address || '—', color: 'bg-emerald-100 text-emerald-600' },
                { icon: CalendarIcon, label: 'Date of Birth', value: teacherProfile.dateOfBirth ? new Date(teacherProfile.dateOfBirth).toLocaleDateString() : '—', color: 'bg-rose-100 text-rose-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Professional */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Professional</h4>
              {[
                { icon: BriefcaseIcon, label: 'Teacher ID', value: teacherProfile.teacherId || '—', color: 'bg-orange-100 text-orange-600' },
                { icon: CalendarIcon, label: 'Employment Date', value: teacherProfile.employmentDate ? new Date(teacherProfile.employmentDate).toLocaleDateString() : '—', color: 'bg-teal-100 text-teal-600' },
                { icon: AcademicCapIcon, label: 'Qualifications', value: teacherProfile.qualifications, color: 'bg-purple-100 text-purple-600' },
                { icon: StarIcon, label: 'Experience', value: teacherProfile.experience, color: 'bg-yellow-100 text-yellow-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MY SUBJECTS ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">My Subjects</h3>
              <p className="text-xs text-gray-400">{teacherProfile.subjects.length} subject{teacherProfile.subjects.length !== 1 ? 's' : ''} assigned</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          {teacherProfile.subjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teacherProfile.subjects.map((subject, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]} p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default`}
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                  <BookOpenIcon className="h-6 w-6 text-white/80 mb-3" />
                  <p className="text-white font-semibold text-sm leading-tight">{subject}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No subjects assigned yet.</p>
              <p className="text-gray-300 text-xs mt-1">Contact admin to assign subjects.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MY CLASSES ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">My Classes</h3>
              <p className="text-xs text-gray-400">{teacherProfile.classes.length} class{teacherProfile.classes.length !== 1 ? 'es' : ''} assigned</p>
            </div>
          </div>
          <a href="/classes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</a>
        </div>
        <div className="p-8">
          {teacherProfile.classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherProfile.classes.map((cls, i) => (
                <div
                  key={i}
                  className={`border-l-4 ${CLASS_COLORS[i % CLASS_COLORS.length]} rounded-2xl p-5 hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{cls}</p>
                      <p className="text-xs text-gray-400 mt-1">Academic Class</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No classes assigned yet.</p>
              <p className="text-gray-300 text-xs mt-1">Contact admin to assign classes.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <BoltIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-400">Jump to key tasks</p>
          </div>
        </div>
        <div className="p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { href: '/results', icon: ClipboardDocumentListIcon, label: 'Enter Results', color: 'bg-blue-500 hover:bg-blue-600', light: 'bg-blue-50 text-blue-600' },
            { href: '/students', icon: AcademicCapIcon, label: 'View Students', color: 'bg-emerald-500 hover:bg-emerald-600', light: 'bg-emerald-50 text-emerald-600' },
            { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages', color: 'bg-violet-500 hover:bg-violet-600', light: 'bg-violet-50 text-violet-600' },
            { href: '/user-reports', icon: DocumentTextIcon, label: 'Submit Report', color: 'bg-orange-500 hover:bg-orange-600', light: 'bg-orange-50 text-orange-600' },
            { href: '/attendance', icon: ChartBarIcon, label: 'Attendance', color: 'bg-rose-500 hover:bg-rose-600', light: 'bg-rose-50 text-rose-600' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.light} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── SCHEDULE + TIPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
              <p className="text-xs text-gray-400">Your classes for today</p>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {[
              { time: '8:00 AM', subject: 'Mathematics', class: 'JSS 2A', room: 'Room 101', color: 'bg-violet-500' },
              { time: '10:00 AM', subject: 'Physics', class: 'SS 3B', room: 'Lab 1', color: 'bg-blue-500' },
              { time: '12:00 PM', subject: 'Mathematics', class: 'SS 1A', room: 'Room 102', color: 'bg-emerald-500' },
              { time: '2:00 PM', subject: 'Further Maths', class: 'SS 3A', room: 'Room 103', color: 'bg-orange-500' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                <div className={`w-1.5 h-12 ${s.color} rounded-full flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{s.subject}</p>
                  <p className="text-xs text-gray-400">{s.class} · {s.room}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex-shrink-0">
                  {s.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Tips / Activity */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Teaching Tips</h3>
              <p className="text-xs text-gray-400">Helpful reminders</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { title: 'Grade Submissions', desc: 'Ensure all CA scores are entered before the deadline.', icon: ClipboardDocumentListIcon, color: 'bg-blue-50 text-blue-600' },
              { title: 'Student Attendance', desc: 'Mark attendance daily to keep accurate records.', icon: ChartBarIcon, color: 'bg-emerald-50 text-emerald-600' },
              { title: 'Parent Communication', desc: 'Reach out to parents of struggling students early.', icon: ChatBubbleLeftRightIcon, color: 'bg-violet-50 text-violet-600' },
              { title: 'Report Submission', desc: 'Submit term reports to admin before the deadline.', icon: DocumentTextIcon, color: 'bg-orange-50 text-orange-600' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tip.color}`}>
                  <tip.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{tip.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
