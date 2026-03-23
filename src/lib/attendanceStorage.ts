// Attendance management system
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  admissionNumber: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  notes?: string;
  markedBy: string; // Teacher ID
  markedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ATTENDANCE_STORAGE_KEY = 'attendance_records';

export const getAttendanceRecords = (): AttendanceRecord[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (stored) {
      const records = JSON.parse(stored);
      return records.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error reading attendance records:', error);
  }
  
  return [];
};

export const saveAttendanceRecord = (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord => {
  const records = getAttendanceRecords();
  
  // Check if attendance already exists for this student on this date
  const existingIndex = records.findIndex(r => 
    r.studentId === record.studentId && 
    r.date === record.date
  );
  
  if (existingIndex !== -1) {
    // Update existing record
    const updatedRecord: AttendanceRecord = {
      ...records[existingIndex],
      ...record,
      updatedAt: new Date()
    };
    
    records[existingIndex] = updatedRecord;
    
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
      return updatedRecord;
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw new Error('Failed to update attendance record');
    }
  } else {
    // Create new record
    const newRecord: AttendanceRecord = {
      ...record,
      id: `attendance-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    records.push(newRecord);
    
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
      return newRecord;
    } catch (error) {
      console.error('Error saving attendance record:', error);
      throw new Error('Failed to save attendance record');
    }
  }
};

export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => record.date === date);
};

export const getAttendanceByStudent = (studentId: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => record.studentId === studentId);
};

export const getAttendanceByClass = (classId: string, date?: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => {
    const classMatch = record.classId === classId;
    const dateMatch = date ? record.date === date : true;
    return classMatch && dateMatch;
  });
};

export const calculateAttendanceStats = (studentId: string, startDate?: string, endDate?: string) => {
  const records = getAttendanceByStudent(studentId);
  
  let filteredRecords = records;
  if (startDate && endDate) {
    filteredRecords = records.filter(r => r.date >= startDate && r.date <= endDate);
  }
  
  const totalDays = filteredRecords.length;
  const presentDays = filteredRecords.filter(r => r.status === 'present').length;
  const absentDays = filteredRecords.filter(r => r.status === 'absent').length;
  const lateDays = filteredRecords.filter(r => r.status === 'late').length;
  const excusedDays = filteredRecords.filter(r => r.status === 'excused').length;
  
  const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;
  
  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    attendanceRate
  };
};
