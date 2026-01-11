'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import { useState } from 'react';
import { 
  CogIcon, 
  AcademicCapIcon, 
  CalendarIcon,
  BellIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  GlobeAltIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface SettingSection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('school');

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access system settings.</p>
        </div>
      </Layout>
    );
  }

  const settingSections: SettingSection[] = [
    {
      id: 'school',
      name: 'School Information',
      description: 'Basic school details and contact information',
      icon: AcademicCapIcon
    },
    {
      id: 'academic',
      name: 'Academic Settings',
      description: 'Terms, grading system, and academic calendar',
      icon: CalendarIcon
    },
    {
      id: 'users',
      name: 'User Management',
      description: 'User roles, permissions, and access control',
      icon: UserGroupIcon
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Email, SMS, and system notification settings',
      icon: BellIcon
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Password policies and security settings',
      icon: ShieldCheckIcon
    },
    {
      id: 'backup',
      name: 'Backup & Data',
      description: 'Data backup and system maintenance',
      icon: CircleStackIcon
    },
    {
      id: 'integration',
      name: 'Integrations',
      description: 'Third-party services and API settings',
      icon: GlobeAltIcon
    },
    {
      id: 'reports',
      name: 'Report Settings',
      description: 'Report templates and generation settings',
      icon: DocumentTextIcon
    }
  ];

  const renderSchoolSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">School Name</label>
          <input
            type="text"
            defaultValue="Shambil Pride Academy Birnin Gwari"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">School Code</label>
          <input
            type="text"
            defaultValue="SPA-BG-001"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            defaultValue="+234 803 401 2480 / +234 807 938 7958"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            defaultValue="Shehubala70@gmail.com"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            rows={3}
            defaultValue="45, Dan Masani Street, Birnin Gwari, Kaduna State, Nigeria"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">School Motto</label>
          <input
            type="text"
            defaultValue="Knowledge is a way to success"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAcademicSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Academic Year</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            {ACADEMIC_SESSIONS.map((session) => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Term</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Grading System</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="nigerian">Nigerian System (A-F)</option>
            <option value="percentage">Percentage (0-100)</option>
            <option value="gpa">GPA System (4.0)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pass Mark</label>
          <input
            type="number"
            defaultValue="50"
            min="0"
            max="100"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Assessment Weights</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">First CA (%)</label>
            <input
              type="number"
              defaultValue="20"
              min="0"
              max="100"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Second CA (%)</label>
            <input
              type="number"
              defaultValue="20"
              min="0"
              max="100"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Exam (%)</label>
            <input
              type="number"
              defaultValue="60"
              min="0"
              max="100"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Default User Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Require Password Change on First Login</h5>
              <p className="text-sm text-gray-500">Force new users to change their password on first login</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Email Verification Required</h5>
              <p className="text-sm text-gray-500">Require email verification for new accounts</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Auto-generate Student IDs</h5>
              <p className="text-sm text-gray-500">Automatically generate unique student ID numbers</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">New User Registration</h5>
              <p className="text-sm text-gray-500">Send email when new users are registered</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Grade Updates</h5>
              <p className="text-sm text-gray-500">Notify parents when grades are updated</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Fee Reminders</h5>
              <p className="text-sm text-gray-500">Send fee payment reminders to parents</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'school':
        return renderSchoolSettings();
      case 'academic':
        return renderAcademicSettings();
      case 'users':
        return renderUserSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return (
          <div className="text-center py-12">
            <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Settings Section</h3>
            <p className="text-gray-500 mt-2">
              This settings section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure school settings and system preferences.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                <nav className="space-y-1">
                  {settingSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <section.icon className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div>{section.name}</div>
                        <div className="text-xs text-gray-500">{section.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {settingSections.find(s => s.id === activeSection)?.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {settingSections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>

                {renderContent()}

                <div className="mt-6 flex justify-end space-x-3">
                  <button className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
      </div>
    </Layout>
  );
}