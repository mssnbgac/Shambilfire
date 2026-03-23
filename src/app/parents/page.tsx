'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getCreatedUsers } from '@/lib/demoUsers';
import Link from 'next/link';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  children?: string[];
  createdAt?: Date;
}

export default function ParentsPage() {
  const { user } = useAuth();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = () => {
    try {
      // Get hardcoded demo parents
      const demoParents: Parent[] = [
        {
          id: 'parent-1',
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'parent@shambil.edu.ng',
          phoneNumber: '+234 803 401 2480',
          address: '45, Dan Masani Street, Birnin Gwari',
          children: ['David Smith'],
          createdAt: new Date('2024-01-01')
        }
      ];

      // Get created parents from localStorage
      const createdUsers = getCreatedUsers();
      const createdParents = createdUsers
        .filter(user => user.role === 'parent')
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          children: user.children || [],
          createdAt: new Date(user.createdAt)
        }));

      // Combine demo and created parents
      const allParents = [...demoParents, ...createdParents];
      setParents(allParents);
    } catch (error) {
      console.error('Error loading parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(parent =>
    parent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (parent.children && parent.children.some(child => 
      child.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  if (!user || !['admin', 'teacher', 'exam_officer'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access parent management.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
            <p className="text-gray-600">Manage parent accounts and information.</p>
          </div>
          {user.role === 'admin' && (
            <Link
              href="/parents/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Parent
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search parents by name, email, or children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadParents}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading parents...</p>
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No parents match your search' : 'No parents found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first parent.'}
              </p>
              {user.role === 'admin' && !searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/parents/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add New Parent
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  All Parents ({filteredParents.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredParents.map((parent) => (
                  <div key={parent.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {parent.firstName.charAt(0)}{parent.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {parent.firstName} {parent.lastName}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Parent
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{parent.email}</span>
                            {parent.phoneNumber && (
                              <>
                                <span>•</span>
                                <span>{parent.phoneNumber}</span>
                              </>
                            )}
                          </div>
                          {parent.children && parent.children.length > 0 && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Children:</span> {parent.children.join(', ')}
                            </div>
                          )}
                          {parent.address && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Address:</span> {parent.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {parent.createdAt && (
                          <span className="text-xs text-gray-400">
                            Added {parent.createdAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}