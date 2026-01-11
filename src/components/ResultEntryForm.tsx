'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { NIGERIAN_SUBJECTS } from '@/types';
import { searchStudentByAdmissionNumber, searchStudents, getAllStudents, StudentSearchResult } from '@/lib/studentSearch';
import { saveStudentGrade } from '@/lib/gradesStorage';
import { ACADEMIC_SESSIONS } from '@/lib/academicSessions';
import { createNotification } from '@/lib/notificationSystem';
import toast from 'react-hot-toast';

interface ResultFormData {
  studentId: string;
  subjectId: string;
  classId: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  academicYear: string;
  firstCA: number;
  secondCA: number;
  exam: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

export default function ResultEntryForm() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ResultFormData>({
    defaultValues: {
      term: 'First Term',
      academicYear: '2023/2024'
    }
  });

  const firstCA = Number(watch('firstCA')) || 0;
  const secondCA = Number(watch('secondCA')) || 0;
  const exam = Number(watch('exam')) || 0;
  const total = firstCA + secondCA + exam;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    // Filter students based on search term
    if (studentSearchTerm.trim()) {
      const filtered = searchStudents(studentSearchTerm);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearchTerm, students]);

  const fetchInitialData = async () => {
    try {
      // Get all students for search functionality
      const allStudents = getAllStudents();
      setStudents(allStudents);
      setFilteredStudents(allStudents);

      // Create demo classes data from NIGERIAN_CLASSES
      const { NIGERIAN_CLASSES } = await import('@/types');
      const classesData = NIGERIAN_CLASSES.map((className, index) => ({
        id: `class_${index}`,
        name: className,
        level: className.includes('Primary') ? 'Primary' : 
               className.includes('JSS') ? 'Junior Secondary' : 
               className.includes('SS') ? 'Senior Secondary' : 
               className.includes('KG') || className.includes('Nursery') ? 'Pre-Primary' : 'Other'
      }));
      setClasses(classesData);

      // Create subjects from Nigerian subjects list
      const subjectsData = NIGERIAN_SUBJECTS.map((subject, index) => ({
        id: `subject_${index}`,
        name: subject,
        code: subject.replace(/\s+/g, '').toUpperCase().substring(0, 3)
      }));
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const fetchClassStudents = (classId: string) => {
    try {
      // Filter students by class
      const classStudents = students.filter(student => 
        student.class.toLowerCase().includes(classId.toLowerCase()) ||
        student.class.replace(/\s+/g, '').toLowerCase() === classId.toLowerCase()
      );
      setFilteredStudents(classStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
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

  const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    if (total >= 50) return 'E';
    return 'F';
  };

  const calculatePosition = async (subjectId: string, classId: string, term: string, academicYear: string, studentTotal: number): Promise<number> => {
    // This would calculate position based on class performance
    // For demo purposes, return a random position
    return Math.floor(Math.random() * 10) + 1;
  };

  const onSubmit = async (data: ResultFormData) => {
    try {
      setLoading(true);

      // Validate scores
      if (Number(data.firstCA) > 20 || Number(data.secondCA) > 20 || Number(data.exam) > 60) {
        toast.error('Invalid scores: CA1 & CA2 max 20 each, Exam max 60');
        return;
      }

      if (!selectedStudent) {
        toast.error('Please select a student');
        return;
      }

      const total = Number(data.firstCA) + Number(data.secondCA) + Number(data.exam);
      const grade = calculateGrade(total);
      
      // Calculate position (for demo purposes)
      const position = await calculatePosition(data.subjectId, data.classId, data.term, data.academicYear, total);
      
      // Get subject name
      const subject = subjects.find(s => s.id === data.subjectId);
      const subjectName = subject?.name || 'Unknown Subject';

      // Save grade to localStorage (demo mode)
      const savedGrade = saveStudentGrade({
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        admissionNumber: selectedStudent.admissionNumber,
        subjectId: data.subjectId,
        subjectName: subjectName,
        classId: data.classId,
        term: data.term,
        academicYear: data.academicYear,
        assessments: {
          firstCA: Number(data.firstCA),
          secondCA: Number(data.secondCA),
          exam: Number(data.exam)
        },
        total,
        grade,
        remark: getGradeRemark(grade),
        position: position,
        teacherId: user?.id || 'unknown'
      });

      console.log('Grade saved:', savedGrade);
      
      // Create notification for student
      createNotification({
        studentId: selectedStudent.id,
        type: 'result',
        academicSession: data.academicYear,
        term: data.term,
        message: `Your ${data.term} result for ${subjectName} (${data.academicYear}) has been uploaded and is ready to download!`
      });
      
      toast.success(`Result entered successfully! 
      
Student: ${selectedStudent.firstName} ${selectedStudent.lastName}
Subject: ${subjectName}
Grade: ${grade} (${total}/100)
Term: ${data.term}, ${data.academicYear}

The grade has been saved and the student has been notified.`);
      
      reset();
      setSelectedStudent(null);
      setStudentSearchTerm('');
    } catch (error) {
      console.error('Error submitting result:', error);
      toast.error('Failed to submit result');
    } finally {
      setLoading(false);
    }
  };

  const getGradeRemark = (grade: string): string => {
    switch (grade) {
      case 'A+': return 'Outstanding';
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Good';
      case 'D': return 'Fair';
      case 'E': return 'Pass';
      case 'F': return 'Fail';
      default: return 'N/A';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
          Enter Student Results
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Academic Info */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Academic Year
              </label>
              <select
                {...register('academicYear', { required: 'Academic year is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {ACADEMIC_SESSIONS.map((session) => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
              {errors.academicYear && (
                <p className="mt-1 text-sm text-red-600">{errors.academicYear.message}</p>
              )}
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
              {errors.term && (
                <p className="mt-1 text-sm text-red-600">{errors.term.message}</p>
              )}
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Class
            </label>
            <select
              {...register('classId', { required: 'Class is required' })}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setValue('classId', e.target.value);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.level}
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
            )}
          </div>

          {/* Student Search and Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search Student (by Name or Admission Number)
              </label>
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => handleStudentSearch(e.target.value)}
                placeholder="Enter student name or admission number (e.g., SPA/2023/001)"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
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
                  <div>
                    <h4 className="font-medium text-green-900">Selected Student</h4>
                    <p className="text-green-700">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                    <p className="text-sm text-green-600">
                      Admission No: {selectedStudent.admissionNumber} | Class: {selectedStudent.class}
                    </p>
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

            {/* Hidden input for form submission */}
            <input
              type="hidden"
              {...register('studentId', { required: 'Student selection is required' })}
            />
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
            )}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              {...register('subjectId', { required: 'Subject is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
            )}
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First CA (Max: 20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                {...register('firstCA', { 
                  required: 'First CA is required',
                  min: { value: 0, message: 'Score cannot be negative' },
                  max: { value: 20, message: 'First CA cannot exceed 20' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.firstCA && (
                <p className="mt-1 text-sm text-red-600">{errors.firstCA.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Second CA (Max: 20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                {...register('secondCA', { 
                  required: 'Second CA is required',
                  min: { value: 0, message: 'Score cannot be negative' },
                  max: { value: 20, message: 'Second CA cannot exceed 20' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.secondCA && (
                <p className="mt-1 text-sm text-red-600">{errors.secondCA.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Exam (Max: 60)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                {...register('exam', { 
                  required: 'Exam score is required',
                  min: { value: 0, message: 'Score cannot be negative' },
                  max: { value: 60, message: 'Exam score cannot exceed 60' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.exam && (
                <p className="mt-1 text-sm text-red-600">{errors.exam.message}</p>
              )}
            </div>
          </div>

          {/* Total and Grade Display */}
          {(firstCA > 0 || secondCA > 0 || exam > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Total Score:</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">{total}/100</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Grade:</span>
                  <span className="ml-2 text-lg font-bold text-green-600">{calculateGrade(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Result'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}