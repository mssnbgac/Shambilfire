// Notification system for student updates
export interface StudentNotification {
  id: string;
  studentId: string;
  type: 'result' | 'payment' | 'both';
  academicSession: string;
  term: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'student_notifications';

export const getStudentNotifications = (studentId: string): StudentNotification[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      return notifications
        .filter((notif: any) => notif.studentId === studentId)
        .map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt)
        }))
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  } catch (error) {
    console.error('Error reading notifications:', error);
  }
  
  return [];
};

export const createNotification = (notification: Omit<StudentNotification, 'id' | 'createdAt' | 'read'>): StudentNotification => {
  const newNotification: StudentNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    read: false
  };
  
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notification:', error);
  }
  
  return newNotification;
};

export const markNotificationAsRead = (notificationId: string): void => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      const updated = notifications.map((notif: any) => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const checkAndCreateNotifications = (studentId: string): void => {
  // This function will be called to check for new results/payments and create notifications
  const { getGradesByStudent } = require('./gradesStorage');
  const { getPaymentsByStudent } = require('./paymentsStorage');
  const { ACADEMIC_SESSIONS, TERMS } = require('./academicSessions');
  
  // Check recent sessions for new data
  const recentSessions = ACADEMIC_SESSIONS.slice(0, 3); // Check last 3 sessions
  
  recentSessions.forEach((session: string) => {
    TERMS.forEach((term: string) => {
      const grades = getGradesByStudent(studentId, session, term);
      const payments = getPaymentsByStudent(studentId, session, term);
      
      const hasGrades = grades.length > 0;
      const hasPayments = payments.length > 0;
      
      if (hasGrades && hasPayments) {
        // Check if notification already exists
        const existingNotifications = getStudentNotifications(studentId);
        const existingNotif = existingNotifications.find(n => 
          n.academicSession === session && n.term === term && n.type === 'both'
        );
        
        if (!existingNotif) {
          createNotification({
            studentId,
            type: 'both',
            academicSession: session,
            term,
            message: `Your ${term} results and payment receipt for ${session} are ready to download!`
          });
        }
      } else if (hasGrades) {
        const existingNotifications = getStudentNotifications(studentId);
        const existingNotif = existingNotifications.find(n => 
          n.academicSession === session && n.term === term && n.type === 'result'
        );
        
        if (!existingNotif) {
          createNotification({
            studentId,
            type: 'result',
            academicSession: session,
            term,
            message: `Your ${term} results for ${session} are ready to download!`
          });
        }
      } else if (hasPayments) {
        const existingNotifications = getStudentNotifications(studentId);
        const existingNotif = existingNotifications.find(n => 
          n.academicSession === session && n.term === term && n.type === 'payment'
        );
        
        if (!existingNotif) {
          createNotification({
            studentId,
            type: 'payment',
            academicSession: session,
            term,
            message: `Your payment receipt for ${term}, ${session} is ready to download!`
          });
        }
      }
    });
  });
};