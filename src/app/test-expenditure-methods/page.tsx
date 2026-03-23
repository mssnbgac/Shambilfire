'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestExpenditureMethodsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Expenditure Methods</h1>
          <p className="text-gray-600">This is a test page for expenditure methods.</p>
          
          {user && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p><strong>Current User:</strong> {user.firstName} {user.lastName} ({user.role})</p>
            </div>
          )}
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p><strong>Result:</strong> {result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}