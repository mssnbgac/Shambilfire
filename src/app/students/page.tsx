'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { fetchAllStudentsFromAPI, StudentSearchResult } from '@/lib/studentSearch';
import { NIGERIAN_CLASSES } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EditForm {
  admissionNumber: string;
  class: string;
  dateOfBirth: string;
  bloodGroup: string;
  parentEmail: string;
  parentPhone: string;
  phoneNumber: string;
  address: string;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentSearchResult | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    admissionNumber: '', class: '', dateOfBirth: '', bloodGroup: '', parentEmail: '', parentPhone: '', phoneNumber: '', address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const all = await fetchAllStudentsFromAPI();
      setStudents(all);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (student: StudentSearchResult) => {
    setEditingStudent(student);
    setEditForm({
      admissionNumber: student.admissionNumber || '',
      class: student.class === 'Not Assigned' ? '' : (student.class || ''),
      dateOfBirth: student.dateOfBirth || '',
      bloodGroup: student.bloodGroup || '',
      parentEmail: student.parentEmail || '',
      parentPhone: (student as any).parentPhone || '',
      phoneNumber: student.phoneNumber || '',
      address: student.address || '',
    });
  };

  const saveEdit = async () => {
    if (!editingStudent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(editingStudent.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNumber: editForm.admissionNumber,
          class: editForm.class,
          dateOfBirth: editForm.dateOfBirth,
          bloodGroup: editForm.bloodGroup,
          parentEmail: editForm.parentEmail,
          parentPhone: editForm.parentPhone,
          phoneNumber: editForm.phoneNumber,
          address: editForm.address,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Student updated successfully');
      setEditingStudent(null);
      await loadStudents();
    } catch {
      toast.error('Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.class || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !['admin', 'teacher', 'exam_officer'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600">Manage student records and information.</p>
          </div>
          {user.role === 'admin' && (
            <Link href="/students/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add New Student
            </Link>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex gap-3">
          <input
            type="text"
            placeholder="Search by name, email, admission number, or class..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={loadStudents} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
            Refresh
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{searchTerm ? 'No students match your search.' : 'No students found.'}</p>
              {user.role === 'admin' && !searchTerm && (
                <Link href="/students/new" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add New Student
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Students ({filteredStudents.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <div key={student.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <div className="text-sm text-gray-500 flex flex-wrap gap-x-3">
                          <span>{student.email}</span>
                          <span>Adm: {student.admissionNumber || <span className="text-red-500">Not set</span>}</span>
                          <span>Class: {student.class === 'Not Assigned' || !student.class
                            ? <span className="text-red-500">Not set</span>
                            : student.class}
                          </span>
                        </div>
                        {student.parentEmail && (
                          <p className="text-xs text-gray-400">Parent: {student.parentEmail}</p>
                        )}
                      </div>
                    </div>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => openEdit(student)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4 flex-shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Student: {editingStudent.firstName} {editingStudent.lastName}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={editForm.admissionNumber}
                    onChange={e => setEditForm(f => ({ ...f, admissionNumber: e.target.value }))}
                    placeholder="e.g. SPA/2026/001"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={editForm.class}
                    onChange={e => setEditForm(f => ({ ...f, class: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Class</option>
                    {NIGERIAN_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={e => setEditForm(f => ({ ...f, bloodGroup: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={editForm.parentEmail}
                    onChange={e => setEditForm(f => ({ ...f, parentEmail: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={editForm.parentPhone}
                    onChange={e => setEditForm(f => ({ ...f, parentPhone: e.target.value }))}
                    placeholder="Parent/Guardian phone"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Phone</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
