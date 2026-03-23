// Payments storage utilities for demo mode
export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  transactionId: string;
  description: string;
  academicSession: string;
  term: string;
  dateIssued: string;
  confirmedBy: string; // Accountant ID
  createdAt: Date;
  updatedAt: Date;
}

const PAYMENTS_STORAGE_KEY = 'student_payments';

export const getStudentPayments = (): StudentPayment[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (stored) {
      const payments = JSON.parse(stored);
      // Convert date strings back to Date objects and ensure amounts are numbers
      return payments.map((payment: any) => ({
        ...payment,
        amount: Number(payment.amount) || 0, // Ensure amount is always a number
        createdAt: new Date(payment.createdAt),
        updatedAt: new Date(payment.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error reading payments data:', error);
  }
  
  return [];
};

export const saveStudentPayment = (payment: Omit<StudentPayment, 'id' | 'createdAt' | 'updatedAt'>): StudentPayment => {
  const payments = getStudentPayments();
  
  const newPayment: StudentPayment = {
    ...payment,
    amount: Number(payment.amount) || 0, // Ensure amount is always a number
    id: `payment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  payments.push(newPayment);
  
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error('Error saving payment:', error);
  }
  
  return newPayment;
};

export const getPaymentsByStudent = (studentId: string, academicYear?: string, term?: string): StudentPayment[] => {
  const allPayments = getStudentPayments();
  
  return allPayments.filter(payment => {
    let matches = payment.studentId === studentId;
    
    if (academicYear) {
      matches = matches && payment.academicSession === academicYear;
    }
    
    if (term) {
      matches = matches && payment.term === term;
    }
    
    return matches;
  });
};

export const getPaymentsByStudentAndSession = (studentId: string, academicYear: string, term: string): StudentPayment[] => {
  return getPaymentsByStudent(studentId, academicYear, term);
};

export const clearAllPayments = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PAYMENTS_STORAGE_KEY);
};

// Reset and initialize demo payments (useful for debugging)
export const resetDemoPayments = (): void => {
  clearAllPayments();
  initializeDemoPayments();
};

// Initialize with comprehensive demo payments for testing
export const initializeDemoPayments = (): void => {
  // Don't automatically initialize demo payments
  // Users can manually create payments as needed
  return;
};

// Get payments by session and term
export const getPaymentsBySessionAndTerm = (academicSession: string, term: string): StudentPayment[] => {
  const allPayments = getStudentPayments();
  return allPayments.filter(payment => 
    payment.academicSession === academicSession && payment.term === term
  );
};

// Get financial overview for a specific session and term
export const getFinancialOverview = (academicSession: string, term: string) => {
  const payments = getPaymentsBySessionAndTerm(academicSession, term);
  
  const totalRevenue = payments.reduce((sum, payment) => {
    // Ensure amount is a number
    const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);
  
  const totalPayments = payments.length;
  
  // Group by payment method
  const paymentMethods = payments.reduce((acc, payment) => {
    const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0;
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Group by description/fee type
  const feeTypes = payments.reduce((acc, payment) => {
    const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0;
    acc[payment.description] = (acc[payment.description] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Recent payments (last 10)
  const recentPayments = payments
    .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())
    .slice(0, 10);
  
  const result = {
    totalRevenue,
    totalPayments,
    paymentMethods,
    feeTypes,
    recentPayments,
    averagePayment: totalPayments > 0 ? totalRevenue / totalPayments : 0,
  };
  
  return result;
};

// Get all sessions that have payments
export const getSessionsWithPayments = (): string[] => {
  const allPayments = getStudentPayments();
  const sessions = [...new Set(allPayments.map(payment => payment.academicSession))];
  return sessions.sort();
};

// Get all terms that have payments for a specific session
export const getTermsWithPayments = (academicSession: string): string[] => {
  const allPayments = getStudentPayments();
  const terms = [...new Set(
    allPayments
      .filter(payment => payment.academicSession === academicSession)
      .map(payment => payment.term)
  )];
  return terms;
};

// Debug function to check current payments in localStorage
export const debugPayments = () => {
  const payments = getStudentPayments();
  console.log('=== PAYMENT DEBUG REPORT ===');
  console.log('Total payments in localStorage:', payments.length);
  
  // Group by session and term
  const grouped = payments.reduce((acc, payment) => {
    const key = `${payment.academicSession} - ${payment.term}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(payment);
    return acc;
  }, {} as Record<string, StudentPayment[]>);
  
  console.log('\n=== PAYMENTS BY SESSION/TERM ===');
  Object.entries(grouped).forEach(([key, sessionPayments]) => {
    const total = sessionPayments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`${key}: ${sessionPayments.length} payments, Total: ₦${total.toLocaleString()}`);
  });
  
  // Summary by session
  const sessionSummary = payments.reduce((acc, payment) => {
    if (!acc[payment.academicSession]) {
      acc[payment.academicSession] = { count: 0, total: 0 };
    }
    acc[payment.academicSession].count++;
    acc[payment.academicSession].total += payment.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);
  
  console.log('\n=== SUMMARY BY SESSION ===');
  Object.entries(sessionSummary).forEach(([session, data]) => {
    console.log(`${session}: ${data.count} payments, Total: ₦${data.total.toLocaleString()}`);
  });
  
  console.log('\n=== GRAND TOTAL ===');
  const grandTotal = payments.reduce((sum, p) => sum + p.amount, 0);
  console.log(`All Sessions: ${payments.length} payments, Total: ₦${grandTotal.toLocaleString()}`);
  
  return { payments, grouped, sessionSummary, grandTotal };
};

// Force refresh demo data (useful for testing)
export const forceRefreshDemoData = () => {
  console.log('=== FORCE REFRESHING DEMO DATA ===');
  clearAllPayments();
  initializeDemoPayments();
  const result = debugPayments();
  console.log('=== DEMO DATA REFRESH COMPLETE ===');
  return result;
};