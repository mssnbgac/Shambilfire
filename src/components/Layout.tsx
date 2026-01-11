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
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Shambil Pride</h1>
                <p className="text-xs text-blue-100">Academy</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
          {/* Desktop Header */}
          <div className="flex h-20 items-center px-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Shambil Pride</h1>
                <p className="text-sm text-blue-100">Academy</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:transform hover:scale-[1.01]'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile in Sidebar */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <button
            type="button"
            className="px-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-between px-6">
            <div className="flex flex-1 items-center">
              {/* Page Title */}
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {navigation.find(item => isActiveRoute(item.href))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <div className="relative">
                <NotificationSystem />
              </div>

              {/* Profile dropdown - Mobile */}
              <div className="lg:hidden flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              </div>

              {/* Logout Button - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/50 hover:bg-white/80 rounded-xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:shadow-md"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>

              {/* Logout Button - Mobile */}
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100/50 transition-colors"
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