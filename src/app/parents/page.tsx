'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
}

export default function ParentsPage() {
  const { user } = useAuth();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        const allUsers: any[] = data.users || [];
        const parentList = allUsers
          .filter(u => u.role === 'parent')
          .map(u => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phoneNumber: u.phoneNumber,
            address: u.address,
            createdAt: u.createdAt,
          }));
        setParents(parentList);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(parent =>
    parent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Link href="/parents/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Add New Parent
            </Link>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search parents by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={loadParents} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No parents match your search' : 'No parents found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first parent.'}
              </p>
              {user.role === 'admin' && !searchTerm && (
                <div className="mt-6">
                  <Link href="/parents/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Add New Parent
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Parents ({filteredParents.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredParents.map((parent) => (
                  <div key={parent.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {parent.firstName.charAt(0)}{parent.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{parent.firstName} {parent.lastName}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Parent</span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{parent.email}</span>
                            {parent.phoneNumber && <><span>•</span><span>{parent.phoneNumber}</span></>}
                          </div>
                          {parent.address && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Address:</span> {parent.address}
                            </div>
                          )}
                        </div>
                      </div>
                      {parent.createdAt && (
                        <span className="text-xs text-gray-400">Added {new Date(parent.createdAt).toLocaleDateString()}</span>
                      )}
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
