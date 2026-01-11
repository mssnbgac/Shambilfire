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
      // Convert date strings back to Date objects
      return payments.map((payment: any) => ({
        ...payment,
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
  const existingPayments = getStudentPayments();
  
  // Only initialize if there are no payments at all
  if (existingPayments.length === 0) {
    const demoPayments = [];
    
    // Generate payments for multiple sessions and all terms
    const sessions = ['2023/2024', '2024/2025', '2025/2026'];
    const terms = ['First Term', 'Second Term', 'Third Term'];
    
    // Student data for generating payments
    const students = [
      { id: 'student-demo-1', name: 'David Smith', admission: 'SPA/2023/001' },
      { id: 'student-demo-2', name: 'John Adebayo', admission: 'SPA/2023/002' },
      { id: 'student-demo-3', name: 'Sarah Johnson', admission: 'SPA/2023/003' },
      { id: 'student-demo-4', name: 'Michael Brown', admission: 'SPA/2023/004' },
      { id: 'student-demo-5', name: 'Fatima Hassan', admission: 'SPA/2023/005' },
      { id: 'student-demo-6', name: 'Emmanuel Okafor', admission: 'SPA/2023/006' },
      { id: 'student-demo-7', name: 'Aisha Musa', admission: 'SPA/2023/007' },
      { id: 'student-demo-8', name: 'Peter Okoro', admission: 'SPA/2023/008' },
      { id: 'student-demo-9', name: 'Blessing Eze', admission: 'SPA/2023/009' },
      { id: 'student-demo-10', name: 'Ibrahim Yusuf', admission: 'SPA/2023/010' }
    ];
    
    const paymentMethods = ['Bank Transfer', 'Cash', 'Debit Card', 'Mobile Money'];
    const banks = ['First Bank Nigeria', 'GTBank', 'Access Bank', 'UBA', 'Zenith Bank'];
    
    let receiptCounter = 1;
    
    // Generate payments for each session and term
    sessions.forEach((session, sessionIndex) => {
      terms.forEach((term, termIndex) => {
        // Generate 3-7 payments per term (random)
        const paymentsCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < paymentsCount; i++) {
          const student = students[Math.floor(Math.random() * students.length)];
          const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          const bank = banks[Math.floor(Math.random() * banks.length)];
          
          // Generate realistic payment amounts (₦30,000 to ₦150,000)
          const baseAmount = 30000 + Math.floor(Math.random() * 120000);
          const amount = Math.round(baseAmount / 5000) * 5000; // Round to nearest 5000
          
          const payment = {
            studentId: student.id,
            studentName: student.name,
            admissionNumber: student.admission,
            receiptNumber: `SPA/${session.split('/')[0]}/${String(receiptCounter).padStart(4, '0')}`,
            amount: amount,
            paymentMethod: paymentMethod,
            bankName: paymentMethod === 'Bank Transfer' ? bank : undefined,
            accountNumber: paymentMethod === 'Bank Transfer' ? `${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            description: `School Fees Payment - ${term}`,
            academicSession: session,
            term: term,
            dateIssued: new Date(2023 + sessionIndex, termIndex * 4, Math.floor(Math.random() * 28) + 1).toISOString(),
            confirmedBy: 'accountant-1'
          };
          
          demoPayments.push(payment);
          receiptCounter++;
        }
      });
    });
    
    // Add some additional payments for current session (2024/2025) to make it more realistic
    const currentSessionPayments = [
      {
        studentId: 'student-current-1',
        studentName: 'Grace Adamu',
        admissionNumber: 'SPA/2024/011',
        receiptNumber: `SPA/2024/${String(receiptCounter++).padStart(4, '0')}`,
        amount: 85000,
        paymentMethod: 'Bank Transfer',
        bankName: 'First Bank Nigeria',
        accountNumber: '2013456789',
        transactionId: 'TXN2024001',
        description: 'School Fees Payment - First Term',
        academicSession: '2024/2025',
        term: 'First Term',
        dateIssued: new Date().toISOString(),
        confirmedBy: 'accountant-1'
      },
      {
        studentId: 'student-current-2',
        studentName: 'Daniel Okonkwo',
        admissionNumber: 'SPA/2024/012',
        receiptNumber: `SPA/2024/${String(receiptCounter++).padStart(4, '0')}`,
        amount: 95000,
        paymentMethod: 'Cash',
        transactionId: 'CASH2024001',
        description: 'School Fees Payment - Second Term',
        academicSession: '2024/2025',
        term: 'Second Term',
        dateIssued: new Date().toISOString(),
        confirmedBy: 'accountant-1'
      }
    ];
    
    demoPayments.push(...currentSessionPayments);
    
    // Save all payments
    demoPayments.forEach(payment => {
      saveStudentPayment(payment);
    });
    
    console.log(`Initialized ${demoPayments.length} demo payments across ${sessions.length} sessions and ${terms.length} terms`);
  }
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