// Notification system — Supabase-backed for cross-device support
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

// ── API-backed functions ──────────────────────────────────────────────────────

export const getStudentNotificationsFromAPI = async (studentId: string): Promise<StudentNotification[]> => {
  try {
    const res = await fetch(`/api/notifications?studentId=${encodeURIComponent(studentId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.notifications || []).map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt || n.created_at || Date.now()),
    }));
  } catch {
    return [];
  }
};

export const markNotificationAsReadAPI = async (notificationId: string): Promise<void> => {
  try {
    await fetch(`/api/notifications?id=${encodeURIComponent(notificationId)}`, { method: 'PUT' });
  } catch { /* non-fatal */ }
};

// ── Legacy localStorage functions (kept for backward compat) ─────────────────

const NOTIFICATIONS_STORAGE_KEY = 'student_notifications';

export const getStudentNotifications = (studentId: string): StudentNotification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      return notifications
        .filter((n: any) => n.studentId === studentId)
        .map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }))
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  } catch { /* ignore */ }
  return [];
};

export const createNotification = (notification: Omit<StudentNotification, 'id' | 'createdAt' | 'read'>): StudentNotification => {
  const newNotification: StudentNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    read: false,
  };
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch { /* ignore */ }
  return newNotification;
};

export const markNotificationAsRead = (notificationId: string): void => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      const updated = notifications.map((n: any) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch { /* ignore */ }
};

export const checkAndCreateNotifications = (studentId: string): void => {
  // No-op — notifications now come from Supabase via API
};
