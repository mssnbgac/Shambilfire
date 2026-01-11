// Academic session utilities for Shambil Pride Academy
// Sessions range from 2023/2024 to 2149/2150 as specified

export const generateAcademicSessions = (): string[] => {
  const sessions = [];
  for (let year = 2023; year <= 2149; year++) {
    sessions.push(`${year}/${year + 1}`);
  }
  return sessions;
};

export const ACADEMIC_SESSIONS = generateAcademicSessions();

export const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

export type Term = typeof TERMS[number];