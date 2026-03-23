'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationSystem from './NotificationSystem';
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const navigation: NavigationItem[] = [
  { name: 'Homepage', href: '/?view=homepage', icon: HomeIcon, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'exam_officer'] },
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'exam_officer'] },
  { name: 'PDF Generator', href: '/pdf-demo', icon: DocumentTextIcon, roles: ['admin', 'teacher', 'exam_officer'] },
  { name: 'Homepage Manager', href: '/homepage-manager', icon: CogIcon, roles: ['admin'] },
  { name: 'Students', href: '/students', icon: AcademicCapIcon, roles: ['admin', 'teacher', 'exam_officer'] },
  { name: 'Teachers', href: '/teachers', icon: UserGroupIcon, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircleIcon, roles: ['admin'] },
  { name: 'Classes', href: '/classes', icon: BookOpenIcon, roles: ['admin', 'teacher'] },
  { name: 'Subjects', href: '/subjects', icon: DocumentTextIcon, roles: ['admin', 'teacher'] },
  { name: 'Timetable', href: '/timetable', icon: CalendarIcon, roles: ['admin', 'teacher', 'student'] },
  { name: 'Library', href: '/library', icon: BookOpenIcon, roles: ['admin', 'teacher', 'student'] },
  { name: 'Attendance', href: '/attendance', icon: ClipboardDocumentListIcon, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Exams', href: '/exams', icon: AcademicCapIcon, roles: ['admin', 'teacher', 'student', 'exam_officer'] },
  { name: 'Grades', href: '/grades', icon: ChartBarIcon, roles: ['admin', 'teacher', 'student', 'parent', 'exam_officer'] },
  { name: 'Results Entry', href: '/results', icon: ClipboardDocumentListIcon, roles: ['teacher', 'exam_officer'] },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['admin', 'teacher', 'parent', 'student', 'exam_officer'] },
  { name: 'Finance', href: '/finance', icon: CurrencyDollarIcon, roles: ['admin', 'accountant', 'parent'] },
  { name: 'My Reports', href: '/user-reports', icon: DocumentTextIcon, roles: ['admin', 'teacher', 'parent', 'student', 'accountant', 'exam_officer'] },
  { name: 'Review Reports', href: '/admin/report-review', icon: ClipboardDocumentListIcon, roles: ['admin'] },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon, roles: ['admin', 'teacher', 'exam_officer'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const isActiveRoute = (href: string) => {
    if (href === '/?view=homepage') {
      return pathname === '/' || pathname.includes('view=homepage');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-72 flex-col bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Mobile Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">Shambil Pride</h1>
                <p className="text-xs text-blue-200">Academy</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <XMarkIcon className="h-4 w-4 text-white" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
          {/* Desktop Header */}
          <div className="flex h-16 items-center px-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">Shambil Pride</h1>
                <p className="text-xs text-blue-200">Academy</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile in Sidebar */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-xs">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-red-500 transition-colors">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <button
            type="button"
            className="px-4 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          <div className="flex flex-1 justify-between px-6">
            <div className="flex flex-1 items-center">
              <div className="hidden md:block">
                <h2 className="text-lg font-bold text-gray-900">
                  {navigation.find(item => isActiveRoute(item.href))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="ml-4 flex items-center gap-3">
              <div className="relative">
                <NotificationSystem />
              </div>
              <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xs">{user.firstName?.[0]}{user.lastName?.[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}