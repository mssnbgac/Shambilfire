'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { searchStudentByAdmissionNumber, searchStudents, getAllStudents, StudentSearchResult } from '@/lib/studentSearch';
import { generatePaymentReceiptPDF, PaymentInfo } from '@/lib/pdfUtils';
import { saveStudentPayment } from '@/lib/paymentsStorage';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_SESSIONS } from '@/lib/academicSessions';
import { createNotification } from '@/lib/notificationSystem';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  UserIcon,
  AcademicCapIcon
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

export default function PaymentConfirmation() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedPayments, setConfirmedPayments] = useState<PaymentInfo[]>([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      academicSession: '2023/2024',
      term: 'First Term',
      paymentMethod: 'bank_transfer'
    }
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    fetchInitialData();
    loadConfirmedPayments();
  }, []);

  useEffect(() => {
    // Filter students based on search term
    if (studentSearchTerm.trim()) {
      const filtered = searchStudents(studentSearchTerm);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [studentSearchTerm, students]);

  const fetchInitialData = () => {
    try {
      const allStudents = getAllStudents();
      setStudents(allStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student data');
    }
  };

  const loadConfirmedPayments = () => {
    try {
      const stored = localStorage.getItem('confirmed_payments');
      if (stored) {
        const payments = JSON.parse(stored);
        setConfirmedPayments(payments);
      }
    } catch (error) {
      console.error('Error loading confirmed payments:', error);
    }
  };

  const saveConfirmedPayment = (payment: PaymentInfo) => {
    try {
      const updated = [...confirmedPayments, payment];
      localStorage.setItem('confirmed_payments', JSON.stringify(updated));
      setConfirmedPayments(updated);
    } catch (error) {
      console.error('Error saving confirmed payment:', error);
    }
  };

  const handleStudentSearch = (searchTerm: string) => {
    setStudentSearchTerm(searchTerm);
    
    // If it looks like an admission number, try exact search first
    if (searchTerm.includes('/') || searchTerm.toUpperCase().includes('SPA')) {
      const exactMatch = searchStudentByAdmissionNumber(searchTerm);
      if (exactMatch) {
        setSelectedStudent(exactMatch);
        setValue('studentId', exactMatch.id);
        return;
      }
    }
    
    // Clear selected student if search term changes
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
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP/${year}${month}${day}/${random}`;
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      setLoading(true);

      const receiptNumber = generateReceiptNumber();
      
      const paymentInfo: PaymentInfo = {
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
          fullName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
          admissionNumber: selectedStudent.admissionNumber,
          dateOfBirth: selectedStudent.dateOfBirth || '',
          class: selectedStudent.class,
          academicSession: data.academicSession,
          term: data.term,
          studentId: selectedStudent.id,
          parentName: selectedStudent.parentEmail?.split('@')[0] || 'N/A',
          parentPhone: selectedStudent.phoneNumber || 'N/A',
          address: selectedStudent.address || 'N/A'
        }
      };

      // Save payment to storage system for student access
      const savedPayment = saveStudentPayment({
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        admissionNumber: selectedStudent.admissionNumber,
        receiptNumber,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        transactionId: data.transactionId,
        description: data.description,
        academicSession: data.academicSession,
        term: data.term,
        dateIssued: new Date().toISOString(),
        confirmedBy: user?.id || 'accountant-1'
      });

      console.log('Payment saved to storage:', savedPayment);

      // Save payment confirmation for local display
      saveConfirmedPayment(paymentInfo);

      // Create notification for student
      createNotification({
        studentId: selectedStudent.id,
        type: 'payment',
        academicSession: data.academicSession,
        term: data.term,
        message: `Your payment receipt for ${data.term} (${data.academicSession}) has been confirmed and is ready to download!`
      });

      // Generate PDF receipt
      await generatePaymentReceiptPDF(paymentInfo);

      toast.success(`Payment confirmed! Receipt ${receiptNumber} generated successfully. Student has been notified.`);
      
      // Reset form
      reset();
      setSelectedStudent(null);
      setStudentSearchTerm('');
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const downloadExistingReceipt = async (payment: PaymentInfo) => {
    try {
      await generatePaymentReceiptPDF(payment);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Confirmation</h2>
            <p className="text-gray-600">Search for students and confirm their payments</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Confirm Student Payment
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Search */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search Student (by Name or Admission Number)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    placeholder="Enter student name or admission number (e.g., SPA/2023/001)"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Student Search Results */}
              {studentSearchTerm && !selectedStudent && filteredStudents.length > 0 && (
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                    Search Results ({filteredStudents.length} found)
                  </div>
                  {filteredStudents.slice(0, 10).map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Admission No: {student.admissionNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Class: {student.class}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Click to select
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Student Display */}
              {selectedStudent && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">Selected Student</h4>
                        <p className="text-green-700">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </p>
                        <p className="text-sm text-green-600">
                          Admission No: {selectedStudent.admissionNumber} | Class: {selectedStudent.class}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null);
                        setStudentSearchTerm('');
                        setValue('studentId', '');
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <input
                type="hidden"
                {...register('studentId', { required: 'Student selection is required' })}
              />
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
              )}
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Academic Session
                </label>
                <select
                  {...register('academicSession', { required: 'Academic session is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ACADEMIC_SESSIONS.map((session) => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Term
                </label>
                <select
                  {...register('term', { required: 'Term is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Description
              </label>
              <select
                {...register('description', { required: 'Payment description is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Payment Type</option>
                <option value="School Fees">School Fees</option>
                <option value="Examination Fees">Examination Fees</option>
                <option value="Development Levy">Development Levy</option>
                <option value="Sports Fees">Sports Fees</option>
                <option value="Library Fees">Library Fees</option>
                <option value="Laboratory Fees">Laboratory Fees</option>
                <option value="Uniform">Uniform</option>
                <option value="Books and Materials">Books and Materials</option>
                <option value="Transport Fees">Transport Fees</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  {...register('paymentMethod', { required: 'Payment method is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="pos">POS</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
            </div>

            {/* Bank Details (conditional) */}
            {(paymentMethod === 'bank_transfer' || paymentMethod === 'online') && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    {...register('bankName')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    {...register('accountNumber')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transaction ID / Reference
              </label>
              <input
                type="text"
                {...register('transactionId', { required: 'Transaction ID is required' })}
                placeholder="Enter transaction reference or receipt number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.transactionId && (
                <p className="mt-1 text-sm text-red-600">{errors.transactionId.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedStudent}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Confirm Payment & Generate Receipt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Confirmed Payments */}
      {confirmedPayments.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Confirmed Payments
            </h3>
            <div className="space-y-3">
              {confirmedPayments.slice(-5).reverse().map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {payment.studentInfo.fullName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.description} - ₦{payment.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Receipt: {payment.receiptNumber} | {new Date(payment.dateIssued).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadExistingReceipt(payment)}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}