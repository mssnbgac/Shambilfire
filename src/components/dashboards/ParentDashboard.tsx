'use client';

import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  UserIcon,
  MapPinIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenByParent } from '@/lib/parentChildLinking';
import { getGradesByStudent } from '@/lib/gradesStorage';
import { getPaymentsByStudent } from '@/lib/paymentsStorage';
import { getAllUsers } from '@/lib/userManagement';
import { CreatedUser } from '@/lib/demoUsers';
import toast from 'react-hot-toast';

interface ChildData {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  averageGrade: number;
  attendance: number;
  recentGrades: any[];
  totalFeesPaid: number;
  pendingFees: number;
  studentInfo: CreatedUser | null;
}

interface ParentStats {
  children: ChildData[];
  totalFeesPaid: number;
  pendingFees: number;
  unreadMessages: number;
  upcomingEvents: any[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentStats>({
    children: [],
    totalFeesPaid: 0,
    pendingFees: 0,
    unreadMessages: 0,
    upcomingEvents: [],
  });
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (user?.role === 'parent') fetchParentData();
  }, [user]);

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      const childLinks = getChildrenByParent(user?.id || '');
      if (childLinks.some(l => l.childId === e.detail.userId)) {
        fetchParentData();
        toast.success('Child information updated');
      }
    };
    window.addEventListener('userDataUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('userDataUpdated', handleUpdate as EventListener);
  }, [user]);

  const fetchParentData = async () => {
    try {
      if (!user) return;
      const childLinks = getChildrenByParent(user.id);
      const allUsers = getAllUsers();
      const childrenData: ChildData[] = [];
      let totalPaid = 0, totalPending = 0;

      for (const link of childLinks) {
        const studentInfo = allUsers.find(u => u.id === link.childId) || null;
        const grades = getGradesByStudent(link.childId);
        const avgGrade = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + (g.total || 0), 0) / grades.length) : 0;
        const payments = getPaymentsByStudent(link.childId);
        const paid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const pending = Math.max(0, 150000 - paid);
        totalPaid += paid;
        totalPending += pending;
        childrenData.push({
          id: link.childId,
          name: link.childName,
          admissionNumber: link.childAdmissionNumber,
          class: link.childClass,
          averageGrade: avgGrade,
          attendance: 95,
          recentGrades: grades.slice(0, 5).map(g => ({ subject: g.subjectName, score: g.total, grade: g.grade })),
          totalFeesPaid: paid,
          pendingFees: pending,
          studentInfo,
        });
      }

      setStats({
        children: childrenData,
        totalFeesPaid: totalPaid,
        pendingFees: totalPending,
        unreadMessages: 2,
        upcomingEvents: [
          { title: 'Parent-Teacher Conference', date: '2024-02-20', type: 'meeting' },
          { title: 'Mid-term Exams Begin', date: '2024-02-15', type: 'exam' },
          { title: 'School Sports Day', date: '2024-03-01', type: 'event' },
        ],
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (stats.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <UserIcon className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Children Linked</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">Contact the school administrator to link your children to your account.</p>
        <a href="/messages" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-medium text-sm">
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          Contact Administrator
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-2xl">
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
                  <span className="text-blue-200 text-sm">Parent Portal</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName}</h1>
                <p className="text-blue-200 text-sm mt-0.5">
                  {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <a href="/messages" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-semibold shadow-lg hover:bg-blue-50 transition-colors">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Messages
              {stats.unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{stats.unreadMessages}</span>
              )}
            </a>
          </div>

          {/* Summary stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Children', value: stats.children.length, icon: AcademicCapIcon },
              { label: 'Fees Paid', value: fmt(stats.totalFeesPaid), icon: CheckCircleIcon },
              { label: 'Pending Fees', value: fmt(stats.pendingFees), icon: ExclamationTriangleIcon },
              { label: 'Messages', value: stats.unreadMessages, icon: ChatBubbleLeftRightIcon },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <s.icon className="h-5 w-5 text-blue-200 mb-2" />
                <p className="text-lg font-bold text-white truncate">{s.value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHILDREN CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.children.map((child, i) => (
          <div key={child.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className={`px-6 py-5 ${i % 2 === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{child.name}</h3>
                  <p className="text-white/80 text-sm">{child.class} · {child.admissionNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedChild(selectedChild?.id === child.id ? null : child)}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <EyeIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                  <p className="text-2xl font-bold text-emerald-600">{child.averageGrade}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Average Grade</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <p className="text-2xl font-bold text-blue-600">{child.attendance}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Attendance</p>
                </div>
              </div>

              {child.recentGrades.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Grades</p>
                  <div className="space-y-2">
                    {child.recentGrades.slice(0, 3).map((g, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-700">{g.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{g.score}%</span>
                          <span className="px-2 py-0.5 bg-gray-200 rounded-lg text-xs font-medium">{g.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-sm font-bold text-emerald-600">{fmt(child.totalFeesPaid)}</p>
                  <p className="text-xs text-gray-400">Paid</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <p className="text-sm font-bold text-yellow-600">{fmt(child.pendingFees)}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>

              {/* Expanded details */}
              {selectedChild?.id === child.id && child.studentInfo && (
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Details</p>
                  {[
                    { icon: UserIcon, label: 'Full Name', value: child.name },
                    { icon: AcademicCapIcon, label: 'Class', value: child.class },
                    { icon: DocumentArrowDownIcon, label: 'Admission No.', value: child.admissionNumber },
                    child.studentInfo.dateOfBirth ? { icon: CalendarIcon, label: 'Date of Birth', value: child.studentInfo.dateOfBirth } : null,
                    child.studentInfo.address ? { icon: MapPinIcon, label: 'Address', value: child.studentInfo.address } : null,
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <item.icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS + EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            {[
              { href: '/grades', icon: ChartBarIcon, label: 'View Grades', color: 'bg-blue-50 text-blue-600' },
              { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Contact School', color: 'bg-violet-50 text-violet-600' },
              { href: '/finance', icon: CurrencyDollarIcon, label: 'Fee Payment', color: 'bg-emerald-50 text-emerald-600' },
            ].map((a) => (
              <a key={a.href} href={a.href} className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <a.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-gray-600 text-center">{a.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6 space-y-3">
            {stats.upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.type === 'meeting' ? 'bg-blue-500' : ev.type === 'exam' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{ev.type}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {new Date(ev.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
