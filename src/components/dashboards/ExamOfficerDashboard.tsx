'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface ExamStats {
  totalExams: number;
  pendingResults: number;
  completedResults: number;
  studentsExamined: number;
  upcomingExams: any[];
  recentActivities: any[];
  gradeDistribution: any[];
}

const GRADE_COLORS: Record<string, string> = {
  A: 'from-emerald-500 to-green-600',
  B: 'from-blue-500 to-indigo-600',
  C: 'from-yellow-500 to-amber-600',
  D: 'from-orange-500 to-red-500',
  F: 'from-red-500 to-rose-600',
};

export default function ExamOfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    pendingResults: 0,
    completedResults: 0,
    studentsExamined: 0,
    upcomingExams: [],
    recentActivities: [],
    gradeDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      setStats({
        totalExams: 45,
        pendingResults: 12,
        completedResults: 33,
        studentsExamined: 1250,
        upcomingExams: [
          { id: '1', subject: 'Mathematics', class: 'JSS 2A', date: '2024-02-15', time: '9:00 AM', duration: '2 hours', venue: 'Hall A' },
          { id: '2', subject: 'English Language', class: 'SS 3B', date: '2024-02-16', time: '10:00 AM', duration: '3 hours', venue: 'Hall B' },
          { id: '3', subject: 'Physics', class: 'SS 2A', date: '2024-02-17', time: '9:00 AM', duration: '2.5 hours', venue: 'Lab 1' },
        ],
        recentActivities: [
          { type: 'result_entry', description: 'Results entered for JSS 1A Mathematics', time: '2 hours ago' },
          { type: 'exam_scheduled', description: 'Mid-term exam scheduled for SS 3', time: '5 hours ago' },
          { type: 'result_published', description: 'First term results published for JSS 2', time: '1 day ago' },
        ],
        gradeDistribution: [
          { grade: 'A', count: 245, percentage: 19.6 },
          { grade: 'B', count: 387, percentage: 31.0 },
          { grade: 'C', count: 298, percentage: 23.8 },
          { grade: 'D', count: 201, percentage: 16.1 },
          { grade: 'F', count: 119, percentage: 9.5 },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
          <p className="text-gray-500 text-sm">Loading exam data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-xl">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="h-4 w-4 text-yellow-300" />
                  <span className="text-violet-200 text-sm">Exam Office</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName}</h1>
                <p className="text-violet-200 text-sm mt-0.5">
                  {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="/exams" className="px-5 py-2.5 bg-white text-violet-700 rounded-xl text-sm font-semibold shadow-lg hover:bg-violet-50 transition-colors">
                Schedule Exam
              </a>
              <a href="/results" className="px-5 py-2.5 bg-white/15 text-white border border-white/20 rounded-xl text-sm font-medium hover:bg-white/25 transition-colors">
                Enter Results
              </a>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Exams', value: stats.totalExams, icon: ClipboardDocumentListIcon },
              { label: 'Pending Results', value: stats.pendingResults, icon: ClockIcon },
              { label: 'Completed', value: stats.completedResults, icon: CheckCircleIcon },
              { label: 'Students Examined', value: stats.studentsExamined.toLocaleString(), icon: AcademicCapIcon },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <s.icon className="h-5 w-5 text-violet-200 mb-2" />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-violet-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <ClipboardDocumentListIcon className="h-5 w-5 text-violet-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/exams', icon: CalendarIcon, label: 'Schedule Exam', color: 'bg-blue-50 text-blue-600' },
            { href: '/results', icon: ClipboardDocumentListIcon, label: 'Enter Results', color: 'bg-emerald-50 text-emerald-600' },
            { href: '/reports?tab=exam-reports', icon: DocumentTextIcon, label: 'My Reports', color: 'bg-violet-50 text-violet-600' },
            { href: '/reports', icon: ChartBarIcon, label: 'Analytics', color: 'bg-orange-50 text-orange-600' },
          ].map((a) => (
            <a key={a.href} href={a.href} className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <a.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-gray-600 text-center">{a.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* UPCOMING EXAMS + GRADE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Upcoming Exams</h3>
          </div>
          <div className="p-6 space-y-4">
            {stats.upcomingExams.map((exam, i) => (
              <div key={exam.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                <div className={`w-1.5 h-16 rounded-full flex-shrink-0 ${i === 0 ? 'bg-violet-500' : i === 1 ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{exam.subject}</p>
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg font-medium">{exam.class}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                    <span>📅 {new Date(exam.date).toLocaleDateString()}</span>
                    <span>🕐 {exam.time}</span>
                    <span>⏱ {exam.duration}</span>
                    <span>📍 {exam.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Grade Distribution</h3>
          </div>
          <div className="p-6 space-y-4">
            {stats.gradeDistribution.map((g) => (
              <div key={g.grade} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADE_COLORS[g.grade]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white font-bold text-sm">{g.grade}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{g.count} students</span>
                    <span className="font-semibold text-gray-900">{g.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${GRADE_COLORS[g.grade]}`} style={{ width: `${g.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6 space-y-3">
            {stats.recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.type === 'result_entry' ? 'bg-blue-100 text-blue-600' : a.type === 'exam_scheduled' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                  {a.type === 'result_entry' ? <ClipboardDocumentListIcon className="h-5 w-5" /> : a.type === 'exam_scheduled' ? <CalendarIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Alerts & Reminders</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Pending Result Entry</p>
                  <p className="text-xs text-yellow-700 mt-0.5">12 exam results pending. Deadline: February 20, 2024</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Upcoming Exam Week</p>
                  <p className="text-xs text-blue-700 mt-0.5">Mid-term examinations begin in 3 days. Ensure all preparations are complete.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
