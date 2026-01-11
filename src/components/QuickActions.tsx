'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  PlusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  HomeIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  roles: string[];
}

const quickActions: QuickAction[] = [
  {
    name: 'Manage Homepage',
    description: 'Edit homepage content',
    href: '/homepage-manager',
    icon: CogIcon,
    color: 'bg-blue-600 hover:bg-blue-700',
    roles: ['admin']
  },
  {
    name: 'View Homepage',
    description: 'Preview public homepage',
    href: '/?view=homepage',
    icon: HomeIcon,
    color: 'bg-gray-600 hover:bg-gray-700',
    roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'exam_officer']
  },
  {
    name: 'Add New Student',
    description: 'Register a new student',
    href: '/students/new',
    icon: AcademicCapIcon,
    color: 'bg-blue-500 hover:bg-blue-600',
    roles: ['admin', 'teacher']
  },
  {
    name: 'Add New Teacher',
    description: 'Register a new teacher',
    href: '/teachers/new',
    icon: UserGroupIcon,
    color: 'bg-green-500 hover:bg-green-600',
    roles: ['admin']
  },
  {
    name: 'Enter Results',
    description: 'Input student grades',
    href: '/results',
    icon: ClipboardDocumentListIcon,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    roles: ['teacher', 'exam_officer']
  },
  {
    name: 'View Reports',
    description: 'Generate analytics reports',
    href: '/reports',
    icon: ChartBarIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
    roles: ['admin', 'teacher', 'exam_officer']
  },
  {
    name: 'Review Reports',
    description: 'Review exam officer reports',
    href: '/reports?tab=admin-review',
    icon: DocumentTextIcon,
    color: 'bg-red-500 hover:bg-red-600',
    roles: ['admin']
  },
  {
    name: 'Manage Finance',
    description: 'Track payments and fees',
    href: '/finance',
    icon: CurrencyDollarIcon,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    roles: ['admin', 'accountant']
  },
  {
    name: 'Confirm Payments',
    description: 'Confirm student payments',
    href: '/finance?tab=confirm-payments',
    icon: CheckCircleIcon,
    color: 'bg-green-500 hover:bg-green-600',
    roles: ['admin', 'accountant']
  },
  {
    name: 'Financial Overview',
    description: 'View financial analytics',
    href: '/finance?tab=financial-overview',
    icon: ChartBarIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
    roles: ['admin', 'accountant']
  },
  {
    name: 'Expenditure Requests',
    description: 'Create expenditure requests',
    href: '/finance?tab=expenditure',
    icon: DocumentTextIcon,
    color: 'bg-orange-500 hover:bg-orange-600',
    roles: ['admin', 'teacher', 'accountant']
  },
  {
    name: 'Approve Expenditure',
    description: 'Review expenditure requests',
    href: '/finance?tab=approvals',
    icon: ClipboardDocumentListIcon,
    color: 'bg-red-500 hover:bg-red-600',
    roles: ['admin']
  },
  {
    name: 'Create Class',
    description: 'Set up new class',
    href: '/classes/new',
    icon: BookOpenIcon,
    color: 'bg-pink-500 hover:bg-pink-600',
    roles: ['admin']
  },
  {
    name: 'View Attendance',
    description: 'Check attendance records',
    href: '/attendance',
    icon: ClipboardDocumentListIcon,
    color: 'bg-teal-500 hover:bg-teal-600',
    roles: ['admin', 'teacher', 'student', 'parent']
  },
  {
    name: 'Send Message',
    description: 'Communicate with users',
    href: '/messages',
    icon: DocumentTextIcon,
    color: 'bg-orange-500 hover:bg-orange-600',
    roles: ['admin', 'teacher', 'parent']
  }
];

export default function QuickActions() {
  const { user } = useAuth();

  if (!user) return null;

  const filteredActions = quickActions.filter(action => 
    action.roles.includes(user.role)
  );

  if (filteredActions.length === 0) return null;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 transition-colors duration-200 group`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.name}</p>
                  <p className="text-xs opacity-90 truncate">{action.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <PlusIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}