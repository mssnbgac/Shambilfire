// Timetable storage utilities for demo mode
export interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  class: string;
  room: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimetableData {
  [classId: string]: {
    [day: string]: {
      [time: string]: TimetableEntry;
    };
  };
}

const TIMETABLE_STORAGE_KEY = 'shambil_timetables';

export const getTimetableData = (): TimetableData => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      Object.keys(data).forEach(classId => {
        Object.keys(data[classId]).forEach(day => {
          Object.keys(data[classId][day]).forEach(time => {
            data[classId][day][time].createdAt = new Date(data[classId][day][time].createdAt);
            data[classId][day][time].updatedAt = new Date(data[classId][day][time].updatedAt);
          });
        });
      });
      return data;
    }
  } catch (error) {
    console.error('Error reading timetable data:', error);
  }
  
  return {};
};

export const saveTimetableData = (data: TimetableData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving timetable data:', error);
  }
};

export const addTimetableEntry = (entry: Omit<TimetableEntry, 'id' | 'createdAt' | 'updatedAt'>): TimetableEntry => {
  const timetableData = getTimetableData();
  
  const newEntry: TimetableEntry = {
    ...entry,
    id: `timetable-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Initialize nested objects if they don't exist
  if (!timetableData[entry.class]) {
    timetableData[entry.class] = {};
  }
  if (!timetableData[entry.class][entry.day]) {
    timetableData[entry.class][entry.day] = {};
  }
  
  // Add the entry
  timetableData[entry.class][entry.day][entry.time] = newEntry;
  
  // Save to localStorage
  saveTimetableData(timetableData);
  
  return newEntry;
};

export const updateTimetableEntry = (entryId: string, updates: Partial<TimetableEntry>): boolean => {
  const timetableData = getTimetableData();
  
  // Find and update the entry
  let found = false;
  Object.keys(timetableData).forEach(classId => {
    Object.keys(timetableData[classId]).forEach(day => {
      Object.keys(timetableData[classId][day]).forEach(time => {
        if (timetableData[classId][day][time].id === entryId) {
          timetableData[classId][day][time] = {
            ...timetableData[classId][day][time],
            ...updates,
            updatedAt: new Date()
          };
          found = true;
        }
      });
    });
  });
  
  if (found) {
    saveTimetableData(timetableData);
  }
  
  return found;
};

export const deleteTimetableEntry = (classId: string, day: string, time: string): boolean => {
  const timetableData = getTimetableData();
  
  if (timetableData[classId] && timetableData[classId][day] && timetableData[classId][day][time]) {
    delete timetableData[classId][day][time];
    saveTimetableData(timetableData);
    return true;
  }
  
  return false;
};

export const getTimetableForClass = (classId: string): { [day: string]: { [time: string]: TimetableEntry } } => {
  const timetableData = getTimetableData();
  return timetableData[classId] || {};
};

export const clearAllTimetables = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TIMETABLE_STORAGE_KEY);
};

export const getTodayScheduleForClass = (classId: string): TimetableEntry[] => {
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today.getDay()];
  
  const classTimetable = getTimetableForClass(classId);
  const todaySchedule = classTimetable[todayName] || {};
  
  // Convert to array and sort by time
  const scheduleArray = Object.values(todaySchedule);
  
  // Sort by time (convert to 24-hour format for proper sorting)
  scheduleArray.sort((a, b) => {
    const timeA = convertTo24Hour(a.time);
    const timeB = convertTo24Hour(b.time);
    return timeA.localeCompare(timeB);
  });
  
  return scheduleArray;
};

// Helper function to convert 12-hour time to 24-hour for sorting
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Generate demo timetable data
export const initializeDemoTimetable = (): void => {
  const existingData = getTimetableData();
  
  // Only initialize if no data exists
  if (Object.keys(existingData).length === 0) {
    const demoEntries = [
      // JSS 2A Schedule
      { day: 'Monday', time: '8:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson', class: 'JSS 2A', room: 'Room 101' },
      { day: 'Monday', time: '9:00 AM', subject: 'English Language', teacher: 'Mrs. Smith', class: 'JSS 2A', room: 'Room 102' },
      { day: 'Monday', time: '10:00 AM', subject: 'Basic Science', teacher: 'Dr. Brown', class: 'JSS 2A', room: 'Lab 1' },
      { day: 'Monday', time: '11:00 AM', subject: 'Social Studies', teacher: 'Mrs. Davis', class: 'JSS 2A', room: 'Room 103' },
      
      { day: 'Tuesday', time: '8:00 AM', subject: 'Physics', teacher: 'Dr. Brown', class: 'JSS 2A', room: 'Lab 1' },
      { day: 'Tuesday', time: '9:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson', class: 'JSS 2A', room: 'Room 101' },
      { day: 'Tuesday', time: '10:00 AM', subject: 'Computer Studies', teacher: 'Mr. Tech', class: 'JSS 2A', room: 'Computer Lab' },
      
      // SS 1Science Schedule
      { day: 'Monday', time: '8:00 AM', subject: 'Physics', teacher: 'Dr. Brown', class: 'SS 1Science', room: 'Lab 1' },
      { day: 'Monday', time: '9:00 AM', subject: 'Chemistry', teacher: 'Mrs. Chemical', class: 'SS 1Science', room: 'Lab 2' },
      { day: 'Monday', time: '10:00 AM', subject: 'Biology', teacher: 'Dr. Life', class: 'SS 1Science', room: 'Lab 3' },
      { day: 'Monday', time: '11:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson', class: 'SS 1Science', room: 'Room 201' },
      
      { day: 'Tuesday', time: '8:00 AM', subject: 'Further Mathematics', teacher: 'Mr. Advanced', class: 'SS 1Science', room: 'Room 202' },
      { day: 'Tuesday', time: '9:00 AM', subject: 'English Language', teacher: 'Mrs. Smith', class: 'SS 1Science', room: 'Room 203' },
    ];
    
    demoEntries.forEach(entry => {
      addTimetableEntry(entry);
    });
  }
};