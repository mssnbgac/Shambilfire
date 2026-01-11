'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'holiday' | 'meeting' | 'event' | 'deadline';
  description?: string;
  location?: string;
}

export default function SchoolCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate]);

  const loadCalendarEvents = () => {
    // Demo events
    const demoEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Mathematics Mid-term Exam',
        date: '2024-01-15',
        time: '09:00',
        type: 'exam',
        description: 'JSS 2 Mathematics examination',
        location: 'Exam Hall A'
      },
      {
        id: '2',
        title: 'Parent-Teacher Conference',
        date: '2024-01-18',
        time: '14:00',
        type: 'meeting',
        description: 'Quarterly parent-teacher meeting',
        location: 'Main Hall'
      },
      {
        id: '3',
        title: 'Science Fair',
        date: '2024-01-22',
        time: '10:00',
        type: 'event',
        description: 'Annual science exhibition',
        location: 'School Grounds'
      },
      {
        id: '4',
        title: 'Fee Payment Deadline',
        date: '2024-01-25',
        type: 'deadline',
        description: 'Last date for term fee payment'
      },
      {
        id: '5',
        title: 'Public Holiday',
        date: '2024-01-26',
        type: 'holiday',
        description: 'Republic Day - School Closed'
      },
      {
        id: '6',
        title: 'English Language Exam',
        date: '2024-01-29',
        time: '09:00',
        type: 'exam',
        description: 'SS 1 English Language examination',
        location: 'Exam Hall B'
      }
    ];

    setEvents(demoEvents);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'holiday':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'deadline':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'holiday':
        return <CalendarIcon className="h-4 w-4" />;
      case 'meeting':
        return <ClockIcon className="h-4 w-4" />;
      case 'event':
        return <CalendarIcon className="h-4 w-4" />;
      case 'deadline':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-blue-100 border-blue-400' : ''}`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded border ${getEventTypeColor(event.type)} truncate`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">School Calendar</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h4 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {renderCalendarDays()}
        </div>

        {/* Event Details */}
        {selectedDate && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Events for {selectedDate.toLocaleDateString()}
            </h4>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{event.title}</h5>
                          {event.time && (
                            <span className="text-sm opacity-75">{event.time}</span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm mt-1 opacity-90">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-xs mt-1 opacity-75">📍 {event.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Event Types</h5>
          <div className="flex flex-wrap gap-3">
            {[
              { type: 'exam', label: 'Exams' },
              { type: 'holiday', label: 'Holidays' },
              { type: 'meeting', label: 'Meetings' },
              { type: 'event', label: 'Events' },
              { type: 'deadline', label: 'Deadlines' }
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded border ${getEventTypeColor(type)}`}></div>
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}