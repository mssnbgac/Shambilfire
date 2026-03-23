// Data migration utilities to ensure data integrity across app restarts
import { getStudentPayments } from './paymentsStorage';

/**
 * Verify and fix all payment amounts to ensure they are numbers
 * This should be run on app initialization to fix any legacy string amounts
 */
export const verifyAndFixPaymentAmounts = (): { fixed: number; total: number } => {
  if (typeof window === 'undefined') return { fixed: 0, total: 0 };
  
  try {
    const stored = localStorage.getItem('student_payments');
    if (!stored) return { fixed: 0, total: 0 };
    
    const payments = JSON.parse(stored);
    let fixedCount = 0;
    
    const fixedPayments = payments.map((payment: any) => {
      const originalAmount = payment.amount;
      const numericAmount = Number(payment.amount) || 0;
      
      // Check if conversion was needed
      if (typeof originalAmount !== 'number' || originalAmount !== numericAmount) {
        fixedCount++;
      }
      
      return {
        ...payment,
        amount: numericAmount
      };
    });
    
    // Save back to localStorage
    localStorage.setItem('student_payments', JSON.stringify(fixedPayments));
    
    console.log(`✅ Payment amounts verified: ${fixedCount} fixed out of ${payments.length} total`);
    return { fixed: fixedCount, total: payments.length };
  } catch (error) {
    console.error('Error verifying payment amounts:', error);
    return { fixed: 0, total: 0 };
  }
};

/**
 * Verify and fix all expenditure amounts to ensure they are numbers
 */
export const verifyAndFixExpenditureAmounts = (): { fixed: number; total: number } => {
  if (typeof window === 'undefined') return { fixed: 0, total: 0 };
  
  try {
    const stored = localStorage.getItem('expenditure_requests');
    if (!stored) return { fixed: 0, total: 0 };
    
    const expenditures = JSON.parse(stored);
    let fixedCount = 0;
    
    const fixedExpenditures = expenditures.map((exp: any) => {
      const originalAmount = exp.amount;
      const numericAmount = Number(exp.amount) || 0;
      
      if (typeof originalAmount !== 'number' || originalAmount !== numericAmount) {
        fixedCount++;
      }
      
      return {
        ...exp,
        amount: numericAmount
      };
    });
    
    localStorage.setItem('expenditure_requests', JSON.stringify(fixedExpenditures));
    
    console.log(`✅ Expenditure amounts verified: ${fixedCount} fixed out of ${expenditures.length} total`);
    return { fixed: fixedCount, total: expenditures.length };
  } catch (error) {
    console.error('Error verifying expenditure amounts:', error);
    return { fixed: 0, total: 0 };
  }
};

/**
 * Verify and fix user data to ensure persistence
 */
export const verifyAndFixUserData = (): { fixed: number; total: number } => {
  if (typeof window === 'undefined') return { fixed: 0, total: 0 };
  
  try {
    const stored = localStorage.getItem('created_users');
    if (!stored) return { fixed: 0, total: 0 };
    
    const users = JSON.parse(stored);
    let fixedCount = 0;
    
    const fixedUsers = users.map((user: any) => {
      let wasFixed = false;
      
      // Ensure dates are Date objects
      if (typeof user.createdAt === 'string') {
        user.createdAt = new Date(user.createdAt);
        wasFixed = true;
      }
      if (typeof user.updatedAt === 'string') {
        user.updatedAt = new Date(user.updatedAt);
        wasFixed = true;
      }
      
      // Ensure required fields exist
      if (!user.id) {
        user.id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        wasFixed = true;
      }
      
      if (wasFixed) fixedCount++;
      
      return user;
    });
    
    // Save back to localStorage
    localStorage.setItem('created_users', JSON.stringify(fixedUsers));
    
    console.log(`✅ User data verified: ${fixedCount} fixed out of ${users.length} total`);
    return { fixed: fixedCount, total: users.length };
  } catch (error) {
    console.error('Error verifying user data:', error);
    return { fixed: 0, total: 0 };
  }
};

/**
 * Run all data migrations and verifications
 * Call this on app initialization
 */
export const runDataMigrations = () => {
  console.log('🔄 Running data migrations...');
  
  const paymentResults = verifyAndFixPaymentAmounts();
  const expenditureResults = verifyAndFixExpenditureAmounts();
  const userResults = verifyAndFixUserData();
  
  const totalFixed = paymentResults.fixed + expenditureResults.fixed + userResults.fixed;
  const totalRecords = paymentResults.total + expenditureResults.total + userResults.total;
  
  if (totalFixed > 0) {
    console.log(`✅ Data migration complete: ${totalFixed} records fixed out of ${totalRecords} total`);
  } else {
    console.log(`✅ Data verification complete: All ${totalRecords} records are valid`);
  }
  
  return {
    payments: paymentResults,
    expenditures: expenditureResults,
    users: userResults,
    totalFixed,
    totalRecords
  };
};

/**
 * Verify data integrity - returns a report of any issues
 */
export const verifyDataIntegrity = () => {
  const payments = getStudentPayments();
  
  // Load expenditures directly from localStorage to avoid import issues
  let expenditures: any[] = [];
  try {
    const stored = localStorage.getItem('expenditure_requests');
    if (stored) {
      expenditures = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading expenditures:', error);
  }
  
  const report = {
    payments: {
      total: payments.length,
      withStringAmounts: payments.filter(p => typeof p.amount !== 'number').length,
      withInvalidAmounts: payments.filter(p => isNaN(Number(p.amount))).length,
      totalAmount: payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    },
    expenditures: {
      total: expenditures.length,
      withStringAmounts: expenditures.filter(e => typeof e.amount !== 'number').length,
      withInvalidAmounts: expenditures.filter(e => isNaN(Number(e.amount))).length,
      totalAmount: expenditures.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    }
  };
  
  console.log('📊 Data Integrity Report:', report);
  return report;
};

/**
 * Get storage statistics
 */
export const getStorageStats = () => {
  if (typeof window === 'undefined') return null;
  
  const stats = {
    payments: {
      count: 0,
      sizeKB: 0
    },
    expenditures: {
      count: 0,
      sizeKB: 0
    },
    users: {
      count: 0,
      sizeKB: 0
    },
    total: {
      count: 0,
      sizeKB: 0
    }
  };
  
  try {
    // Payments
    const paymentsData = localStorage.getItem('student_payments');
    if (paymentsData) {
      stats.payments.count = JSON.parse(paymentsData).length;
      stats.payments.sizeKB = Math.round((paymentsData.length * 2) / 1024); // Rough estimate
    }
    
    // Expenditures
    const expendituresData = localStorage.getItem('expenditure_requests');
    if (expendituresData) {
      stats.expenditures.count = JSON.parse(expendituresData).length;
      stats.expenditures.sizeKB = Math.round((expendituresData.length * 2) / 1024);
    }
    
    // Users
    const usersData = localStorage.getItem('created_users');
    if (usersData) {
      stats.users.count = JSON.parse(usersData).length;
      stats.users.sizeKB = Math.round((usersData.length * 2) / 1024);
    }
    
    stats.total.count = stats.payments.count + stats.expenditures.count + stats.users.count;
    stats.total.sizeKB = stats.payments.sizeKB + stats.expenditures.sizeKB + stats.users.sizeKB;
    
    console.log('💾 Storage Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return stats;
  }
};
