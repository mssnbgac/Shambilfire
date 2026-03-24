'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserGroupIcon,
  TrashIcon,
  LinkIcon,
  UserPlusIcon,
  AcademicCapIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ParentChildLink {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  childId: string;
  childName: string;
  childAdmissionNumber: string;
  childClass: string;
  createdAt: string;
}

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber?: string;
  class?: string;
}

export default function ParentChildManager() {
  const { user } = useAuth();
  const [links, setLinks] = useState<ParentChildLink[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [parents, setParents] = useState<UserOption[]>([]);
  const [showCreateParent, setShowCreateParent] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [parentForm, setParentForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phoneNumber: '', address: ''
  });

  const [linkForm, setLinkForm] = useState({ parentId: '', childId: '' });

  useEffect(() => {
    if (user?.role === 'admin') loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [linksRes, usersRes] = await Promise.all([
        fetch('/api/parent-child-links'),
        fetch('/api/users'),
      ]);

      if (linksRes.ok) {
        const d = await linksRes.json();
        setLinks(d.links || []);
      }

      if (usersRes.ok) {
        const d = await usersRes.json();
        const allUsers: any[] = d.users || [];
        setStudents(allUsers.filter(u => u.role === 'student').map(u => ({
          id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email,
          admissionNumber: u.admissionNumber, class: u.class,
        })));
        setParents(allUsers.filter(u => u.role === 'parent').map(u => ({
          id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email,
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParent = async () => {
    if (!parentForm.firstName.trim() || !parentForm.lastName.trim() ||
        !parentForm.email.trim() || !parentForm.password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parentForm, role: 'parent' }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create parent');
      }

      const data = await res.json();
      setParents(prev => [...prev, {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
      }]);
      setParentForm({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', address: '' });
      setShowCreateParent(false);
      toast.success('Parent account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create parent account');
    }
  };

  const handleCreateLink = async () => {
    if (!linkForm.parentId || !linkForm.childId) {
      toast.error('Please select both parent and child');
      return;
    }

    const existing = links.find(l => l.parentId === linkForm.parentId && l.childId === linkForm.childId);
    if (existing) { toast.error('This parent-child link already exists'); return; }

    const parent = parents.find(p => p.id === linkForm.parentId);
    const child = students.find(s => s.id === linkForm.childId);
    if (!parent || !child) { toast.error('Invalid parent or child selection'); return; }

    try {
      const res = await fetch('/api/parent-child-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: parent.id,
          parentName: `${parent.firstName} ${parent.lastName}`,
          parentEmail: parent.email,
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          childAdmissionNumber: child.admissionNumber || 'N/A',
          childClass: child.class || 'N/A',
        }),
      });

      if (!res.ok) throw new Error('Failed to create link');
      const data = await res.json();
      setLinks(prev => [...prev, data.link]);
      setLinkForm({ parentId: '', childId: '' });
      setShowLinkForm(false);
      toast.success('Parent-child link created successfully!');
    } catch (error) {
      toast.error('Failed to create parent-child link');
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to remove this parent-child link?')) return;
    try {
      const res = await fetch(`/api/parent-child-links?id=${linkId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove link');
      setLinks(prev => prev.filter(l => l.id !== linkId));
      toast.success('Parent-child link removed successfully!');
    } catch {
      toast.error('Failed to remove parent-child link');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators can manage parent-child relationships.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parent-Child Management</h2>
          <p className="text-gray-600">Create parent accounts and link them to their children</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowCreateParent(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />Create Parent
          </button>
          <button onClick={() => setShowLinkForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />Link Parent & Child
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { icon: UserGroupIcon, label: 'Total Links', value: links.length, color: 'text-blue-400' },
          { icon: UserPlusIcon, label: 'Total Parents', value: parents.length, color: 'text-green-400' },
          { icon: AcademicCapIcon, label: 'Total Students', value: students.length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500">{s.label}</dt>
                <dd className="text-lg font-medium text-gray-900">{s.value}</dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Links Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Parent-Child Links</h3>
          {links.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Links Created</h3>
              <p className="text-gray-500 mt-2">Create parent accounts and link them to their children to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Parent', 'Child', 'Class', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{link.parentName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />{link.parentEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{link.childName}</div>
                        <div className="text-sm text-gray-500">{link.childAdmissionNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{link.childClass}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleRemoveLink(link.id)} className="text-red-600 hover:text-red-900 flex items-center">
                          <TrashIcon className="h-4 w-4 mr-1" />Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Parent Modal */}
      {showCreateParent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Parent Account</h3>
              <button onClick={() => setShowCreateParent(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(['firstName', 'lastName'] as const).map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700">{field === 'firstName' ? 'First Name' : 'Last Name'} *</label>
                    <input type="text" value={parentForm[field]} onChange={e => setParentForm(p => ({ ...p, [field]: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input type="email" value={parentForm.email} onChange={e => setParentForm(p => ({ ...p, email: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input type="password" value={parentForm.password} onChange={e => setParentForm(p => ({ ...p, password: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" value={parentForm.phoneNumber} onChange={e => setParentForm(p => ({ ...p, phoneNumber: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea value={parentForm.address} onChange={e => setParentForm(p => ({ ...p, address: e.target.value }))} rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowCreateParent(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateParent} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create Parent</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Link Parent & Child</h3>
              <button onClick={() => setShowLinkForm(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Parent *</label>
                <select value={linkForm.parentId} onChange={e => setLinkForm(p => ({ ...p, parentId: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Choose a parent...</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Child *</label>
                <select value={linkForm.childId} onChange={e => setLinkForm(p => ({ ...p, childId: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Choose a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber || 'No admission number'})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowLinkForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateLink} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
