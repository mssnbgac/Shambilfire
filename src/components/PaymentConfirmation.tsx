'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { searchStudentByAdmissionNumber, searchStudents, fetchAllStudentsFromAPI, getAllStudents, StudentSearchResult } from '@/lib/studentSearch';
import { generatePaymentReceiptPDF, PaymentInfo } from '@/lib/pdfUtils';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_SESSIONS } from '@/lib/academicSessions';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  UserIcon,
  AcademicCapIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface PaymentFormData {
  studentId: string;
  amount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  transactionId: string;
  description: string;
  academicSession: string;
  term: string;
}

interface ConfirmedPayment {
  id: string;
  studentName: string;
  admissionNumber: string;
  receiptNumber: string;
  amount: number;
  description: string;
  paymentMethod: string;
  academicSession: string;
  term: string;
  dateIssued: string;
  studentId: string;
  studentClass: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  address: string;
  transactionId: string;
  bankName?: string;
  accountNumber?: string;
}

export default function PaymentConfirmation() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedPayments, setConfirmedPayments] = useState<ConfirmedPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      academicSession: '2025/2026',
      term: 'First Term',
      paymentMethod: 'bank_transfer',
    },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    fetchInitialData();
    loadConfirmedPayments();
  }, []);

  useEffect(() => {
    if (studentSearchTerm.trim()) {
      const term = studentSearchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(s =>
          s.firstName.toLowerCase().includes(term) ||
          s.lastName.toLowerCase().includes(term) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
          s.admissionNumber.toLowerCase().includes(term) ||
          s.class.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredStudents([]);
    }
  }, [studentSearchTerm, students]);

  const fetchInitialData = async () => {
    try {
      const apiStudents = await fetchAllStudentsFromAPI();
      setStudents(apiStudents);
    } catch {
      setStudents(getAllStudents());
    }
  };

  const loadConfirmedPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/payments?limit=20');
      if (res.ok) {
        const data = await res.json();
        const mapped: ConfirmedPayment[] = (data.payments || []).map((p: any) => ({
          id: p.id,
          studentName: p.studentName,
          admissionNumber: p.admissionNumber || '',
          receiptNumber: p.receiptNumber || p.id,
          amount: p.amount,
          description: p.paymentType || p.feeType || p.notes || 'School Fees',
          paymentMethod: p.paymentMethod || 'cash',
          academicSession: p.academicSession,
          term: p.term,
          dateIssued: p.dateIssued || p.createdAt,
          studentId: p.studentId || '',
          studentClass: p.studentClass || '',
          dateOfBirth: p.dateOfBirth || '',
          parentName: p.parentName || '',
          parentPhone: p.parentPhone || '',
          address: p.address || '',
          transactionId: p.transactionId || '',
          bankName: p.bankName,
          accountNumber: p.accountNumber,
        }));
        setConfirmedPayments(mapped);
      }
    } catch {
      // silent
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleStudentSearch = (searchTerm: string) => {
    setStudentSearchTerm(searchTerm);
    if (searchTerm.includes('/') || searchTerm.toUpperCase().includes('SPA')) {
      const exactMatch = students.find(
        s => s.admissionNumber.toLowerCase() === searchTerm.toLowerCase()
      );
      if (exactMatch) {
        setSelectedStudent(exactMatch);
        setValue('studentId', exactMatch.id);
        return;
      }
    }
    if (selectedStudent && !searchTerm.includes(selectedStudent.admissionNumber)) {
      setSelectedStudent(null);
      setValue('studentId', '');
    }
  };

  const handleStudentSelect = (student: StudentSearchResult) => {
    setSelectedStudent(student);
    setValue('studentId', student.id);
    setStudentSearchTerm(`${student.firstName} ${student.lastName} (${student.admissionNumber})`);
  };

  const generateReceiptNumber = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `RCP/${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}/${random}`;
  };

  const buildPaymentInfo = (data: PaymentFormData, student: StudentSearchResult, receiptNumber: string): PaymentInfo => ({
    receiptNumber,
    dateIssued: new Date().toISOString(),
    transactionId: data.transactionId,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    description: data.description,
    academicSession: data.academicSession,
    term: data.term,
    studentInfo: {
      fullName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      dateOfBirth: student.dateOfBirth || '',
      class: student.class,
      academicSession: data.academicSession,
      term: data.term,
      studentId: student.id,
      parentName: student.parentEmail?.split('@')[0] || 'N/A',
      parentPhone: student.phoneNumber || 'N/A',
      address: student.address || 'N/A',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedStudent) { toast.error('Please select a student'); return; }

    setLoading(true);
    try {
      const receiptNumber = generateReceiptNumber();
      const paymentInfo = buildPaymentInfo(data, selectedStudent, receiptNumber);

      // 1. Save to Supabase
      const apiRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
          admissionNumber: selectedStudent.admissionNumber,
          receiptNumber,
          amount: data.amount,
          paymentType: data.description,
          paymentMethod: data.paymentMethod,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          transactionId: data.transactionId,
          notes: data.description,
          session: data.academicSession,
          term: data.term,
          status: 'confirmed',
          payment_date: new Date().toISOString(),
          confirmed_by: user?.id || 'accountant-1',
          confirmed_at: new Date().toISOString(),
          // Extra fields for receipt reconstruction
          student_class: selectedStudent.class,
          date_of_birth: selectedStudent.dateOfBirth || '',
          parent_name: selectedStudent.parentEmail?.split('@')[0] || 'N/A',
          parent_phone: selectedStudent.phoneNumber || 'N/A',
          address: selectedStudent.address || 'N/A',
        }),
      });

      if (!apiRes.ok) {
        const err = await apiRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save payment');
      }

      // 2. Generate PDF immediately for accountant
      await generatePaymentReceiptPDF(paymentInfo);

      // 3. Store notification in Supabase via a simple key-value in homepage table
      //    (reuse homepage table as a notifications store since we don't have a dedicated table)
      //    Actually store in payments notes — notification is implicit: student queries by name
      //    Just write a notification record to localStorage for cross-device via API
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            type: 'payment',
            academicSession: data.academicSession,
            term: data.term,
            message: `Your payment of ₦${Number(data.amount).toLocaleString()} for ${data.description} (${data.term}, ${data.academicSession}) has been confirmed. Receipt: ${receiptNumber}`,
          }),
        });
      } catch { /* notifications table may not exist yet, non-fatal */ }

      toast.success(`Payment confirmed! Receipt ${receiptNumber} generated.`);

      // 4. Reload confirmed payments list
      await loadConfirmedPayments();

      reset();
      setSelectedStudent(null);
      setStudentSearchTerm('');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error(error.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (payment: ConfirmedPayment) => {
    try {
      const paymentInfo: PaymentInfo = {
        receiptNumber: payment.receiptNumber,
        dateIssued: payment.dateIssued,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        bankName: payment.bankName,
        accountNumber: payment.accountNumber,
        description: payment.description,
        academicSession: payment.academicSession,
        term: payment.term,
        studentInfo: {
          fullName: payment.studentName,
          admissionNumber: payment.admissionNumber,
          dateOfBirth: payment.dateOfBirth,
          class: payment.studentClass,
          academicSession: payment.academicSession,
          term: payment.term,
          studentId: payment.studentId,
          parentName: payment.parentName,
          parentPhone: payment.parentPhone,
          address: payment.address,
        },
      };
      await generatePaymentReceiptPDF(paymentInfo);
      toast.success('Receipt downloaded');
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-3">
        <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Confirmation</h2>
          <p className="text-gray-600">Search for students and confirm their payments</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Confirm Student Payment</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search Student</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  placeholder="Enter student name or admission number"
                  className="block w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {studentSearchTerm && !selectedStudent && filteredStudents.length > 0 && (
              <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                  {filteredStudents.length} result(s)
                </div>
                {filteredStudents.slice(0, 10).map((student) => (
                  <div key={student.id} onClick={() => handleStudentSelect(student)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                    <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-500">Adm: {student.admissionNumber} | Class: {student.class}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedStudent && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                    <p className="text-sm text-green-600">Adm: {selectedStudent.admissionNumber} | Class: {selectedStudent.class}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedStudent(null); setStudentSearchTerm(''); setValue('studentId', ''); }}
                  className="text-green-600 hover:text-green-800 text-sm">Change</button>
              </div>
            )}

            <input type="hidden" {...register('studentId', { required: 'Student selection is required' })} />
            {errors.studentId && <p className="text-sm text-red-600">{errors.studentId.message}</p>}
          </div>

          {/* Session / Term */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Session</label>
              <select {...register('academicSession', { required: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {ACADEMIC_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Term</label>
              <select {...register('term', { required: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Type</label>
            <select {...register('description', { required: 'Payment type is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Payment Type</option>
              {['School Fees','Examination Fees','Development Levy','Sports Fees','Library Fees','Laboratory Fees','Uniform','Books and Materials','Transport Fees','Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* Amount / Method */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₦)</label>
              <input type="number" min="0" step="0.01"
                {...register('amount', { required: 'Amount is required', min: 0, valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select {...register('paymentMethod', { required: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="pos">POS</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
          </div>

          {(paymentMethod === 'bank_transfer' || paymentMethod === 'online') && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input type="text" {...register('bankName')}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input type="text" {...register('accountNumber')}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction ID / Reference</label>
            <input type="text" {...register('transactionId', { required: 'Transaction ID is required' })}
              placeholder="Enter transaction reference"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            {errors.transactionId && <p className="text-sm text-red-600">{errors.transactionId.message}</p>}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading || !selectedStudent}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Processing...</span></>
              ) : (
                <><CheckCircleIcon className="h-4 w-4" /><span>Confirm Payment & Generate Receipt</span></>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmed Payments List */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirmed Payments</h3>
          <button onClick={loadConfirmedPayments} disabled={loadingPayments}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <ArrowPathIcon className={`h-4 w-4 ${loadingPayments ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loadingPayments ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : confirmedPayments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No confirmed payments yet</p>
        ) : (
          <div className="space-y-3">
            {confirmedPayments.slice(0, 20).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{payment.studentName}</div>
                    <div className="text-sm text-gray-600">{payment.description} — {fmt(payment.amount)}</div>
                    <div className="text-xs text-gray-500">
                      Receipt: {payment.receiptNumber} | {payment.term}, {payment.academicSession} | {new Date(payment.dateIssued).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button onClick={() => downloadReceipt(payment)}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 ml-4 flex-shrink-0">
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span className="text-sm">Receipt</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
