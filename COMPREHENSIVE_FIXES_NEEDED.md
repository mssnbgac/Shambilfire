# Comprehensive System Fixes Needed

## Issues Identified

### 1. Teacher Information Enhancement ⏳
**Issue**: Teacher update form lacks teaching subject, class assignments, and working experience fields
**Files**: 
- `src/app/teachers/new/page.tsx`
- `src/components/UserSearchAndUpdate.tsx`
- `src/types/index.ts`

**Fix**: Add teacher-specific fields to creation and update forms

### 2. Teachers in Timetable Options ⏳
**Issue**: Created teachers don't appear as options when creating/managing timetable
**Files**:
- `src/components/TimetableManager.tsx`
- `src/lib/userManagement.ts`

**Fix**: Load actual teachers from user storage instead of hardcoded list

### 3. Break Time Correction ⏳
**Issue**: Break time should be 10:00am - 10:40am (currently 10:00am - 10:20am)
**Files**:
- `src/components/TimetableManager.tsx`

**Fix**: Update timeSlots array

### 4. Edit Button in Class Management ⏳
**Issue**: Edit button not working when managing classes
**Files**:
- `src/app/classes/page.tsx`

**Fix**: Implement edit functionality with navigation to edit page

### 5. User Persistence Issue 🔴 CRITICAL
**Issue**: Users disappear after refresh/restart
**Files**:
- `src/lib/demoUsers.ts`
- `src/lib/userManagement.ts`
- `src/lib/dataMigration.ts`

**Fix**: Ensure users are properly saved to localStorage and loaded on app start

### 6. Message Sent Count Issue ⏳
**Issue**: Sent count showing 0 even after sending messages
**Files**:
- `src/components/MessagingSystem.tsx`
- `src/app/messages/page.tsx`

**Fix**: Update sent count calculation

### 7. Incomplete Classes in Teacher Dashboard ⏳
**Issue**: Classes in teacher dashboard seem incomplete
**Files**:
- `src/components/dashboards/TeacherDashboard.tsx`
- `src/lib/classStorage.ts`

**Fix**: Load and display all assigned classes properly

### 8. User Search Not Working Across Roles 🔴 CRITICAL
**Issue**: User created as admin not found when searched by accountant/exam officer
**Files**:
- `src/components/UniversalUserSearch.tsx`
- `src/lib/userManagement.ts`
- `src/lib/studentSearch.ts`

**Fix**: Unify user search across all storage systems

## Priority Order

1. **CRITICAL**: User Persistence (#5)
2. **CRITICAL**: User Search Across Roles (#8)
3. **HIGH**: Teacher Information Enhancement (#1)
4. **HIGH**: Teachers in Timetable (#2)
5. **MEDIUM**: Edit Button in Classes (#4)
6. **MEDIUM**: Message Sent Count (#6)
7. **MEDIUM**: Incomplete Classes in Teacher Dashboard (#7)
8. **LOW**: Break Time Correction (#3)

## Implementation Plan

### Phase 1: Critical Fixes (User Persistence & Search)
- Fix user persistence in localStorage
- Add user data migration for existing users
- Unify user search across all systems
- Test cross-role user access

### Phase 2: Teacher System Enhancement
- Add teacher-specific fields
- Load teachers in timetable
- Update teacher dashboard

### Phase 3: UI/UX Improvements
- Fix edit button in classes
- Fix message sent count
- Update break time

## Testing Checklist

- [ ] Create user as admin
- [ ] Refresh page - user should still exist
- [ ] Close browser and reopen - user should still exist
- [ ] Search for user as accountant - should find user
- [ ] Search for user as exam officer - should find user
- [ ] Create teacher with subjects and experience
- [ ] Teacher should appear in timetable options
- [ ] Edit class - should work
- [ ] Send message - sent count should update
- [ ] View teacher dashboard - all classes should show
- [ ] Break time should be 10:00-10:40

## Status
🔴 In Progress - Starting with critical fixes
