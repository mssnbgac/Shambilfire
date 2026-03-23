# Remaining Fixes to Apply

## Completed So Far ✅

1. ✅ User Persistence - Fixed storage key standardization
2. ✅ User Data Migration - Added to dataMigration.ts
3. ✅ Unified User Search - Added getAllUsersUnified()
4. ✅ Teacher Fields - Added to interface
5. ✅ Break Time - Fixed to 10:00-10:40
6. ✅ Teachers in Timetable - Load from storage
7. ✅ Edit Button in Classes - Added Link and edit page
8. ✅ Class Edit Page - Created new file

## Still Need to Apply

### 1. Teacher Form Enhancement
**File**: `src/app/teachers/new/page.tsx`
**Add these fields to the form**:
```typescript
// Add after existing fields
<div>
  <label>Teaching Subjects *</label>
  <div className="grid grid-cols-2 gap-2">
    {NIGERIAN_SUBJECTS.map(subject => (
      <label key={subject}>
        <input
          type="checkbox"
          checked={teachingSubjects.includes(subject)}
          onChange={() => handleSubjectToggle(subject)}
        />
        {subject}
      </label>
    ))}
  </div>
</div>

<div>
  <label>Class Assignments</label>
  <select multiple>
    {NIGERIAN_CLASSES.map(cls => (
      <option key={cls} value={cls}>{cls}</option>
    ))}
  </select>
</div>

<div>
  <label>Working Experience</label>
  <textarea
    value={workingExperience}
    onChange={(e) => setWorkingExperience(e.target.value)}
    placeholder="Years of experience, previous schools, etc."
  />
</div>

<div>
  <label>Qualifications</label>
  <input
    type="text"
    value={qualifications}
    onChange={(e) => setQualifications(e.target.value)}
    placeholder="B.Ed, M.Ed, etc."
  />
</div>
```

### 2. Teacher Update Form Enhancement
**File**: `src/components/UserSearchAndUpdate.tsx`
**Add teacher fields in the update form** (around line 400):
```typescript
{updateForm.role === 'teacher' && (
  <>
    <div>
      <label>Teaching Subjects</label>
      {/* Add subject checkboxes */}
    </div>
    <div>
      <label>Class Assignments</label>
      {/* Add class multi-select */}
    </div>
    <div>
      <label>Working Experience</label>
      <textarea
        value={updateForm.workingExperience || ''}
        onChange={(e) => setUpdateForm(prev => ({ ...prev, workingExperience: e.target.value }))}
      />
    </div>
    <div>
      <label>Qualifications</label>
      <input
        value={updateForm.qualifications || ''}
        onChange={(e) => setUpdateForm(prev => ({ ...prev, qualifications: e.target.value }))}
      />
    </div>
  </>
)}
```

### 3. Message Sent Count Fix
**File**: `src/components/MessagingSystem.tsx`
**Find the sent count calculation and fix it**:
```typescript
// Current (wrong):
const sentCount = messages.filter(m => m.from === user?.email).length;

// Should be:
const sentCount = messages.filter(m => 
  m.senderId === user?.id || m.from === user?.email
).length;
```

**File**: `src/app/messages/page.tsx`
**Update the sent messages display**:
```typescript
const sentMessages = messages.filter(m => 
  m.senderId === user?.id || m.from === user?.email
);
```

### 4. Teacher Dashboard Classes Fix
**File**: `src/components/dashboards/TeacherDashboard.tsx`
**Load all classes and filter by teacher**:
```typescript
import { getClasses } from '@/lib/classStorage';

// In component:
const [assignedClasses, setAssignedClasses] = useState<SchoolClass[]>([]);

useEffect(() => {
  const allClasses = getClasses();
  const teacherClasses = allClasses.filter(cls => 
    cls.classTeacher === `${user.firstName} ${user.lastName}` ||
    cls.classTeacherId === user.id
  );
  setAssignedClasses(teacherClasses);
}, [user]);

// Display all assigned classes with full information
```

### 5. Universal User Search Component Update
**File**: `src/components/UniversalUserSearch.tsx`
**Update to use unified search**:
```typescript
import { getAllUsersUnified, searchUserByEmailUnified } from '@/lib/userManagement';

// Replace searchUserByEmail with searchUserByEmailUnified
// Replace getAllUsers with getAllUsersUnified
```

### 6. Student Search Update
**File**: `src/lib/studentSearch.ts`
**Include all users in search**:
```typescript
import { getAllUsersUnified } from './userManagement';

export const getAllStudents = (): StudentSearchResult[] => {
  // Get all users
  const allUsers = getAllUsersUnified();
  
  // Filter and map students
  return allUsers
    .filter(user => user.role === 'student')
    .map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      // ... rest of mapping
    }));
};
```

## Quick Apply Commands

For each file, the changes are:

1. **demoUsers.ts** - ✅ DONE
2. **dataMigration.ts** - ✅ DONE  
3. **userManagement.ts** - ✅ DONE
4. **TimetableManager.tsx** - ✅ DONE
5. **classes/page.tsx** - ✅ DONE
6. **classes/edit/[id]/page.tsx** - ✅ DONE
7. **classStorage.ts** - ✅ DONE

Still need:
8. **teachers/new/page.tsx** - Add teacher fields
9. **UserSearchAndUpdate.tsx** - Add teacher update fields
10. **MessagingSystem.tsx** - Fix sent count
11. **messages/page.tsx** - Fix sent messages
12. **TeacherDashboard.tsx** - Load all classes
13. **UniversalUserSearch.tsx** - Use unified search
14. **studentSearch.ts** - Include all users

## Testing After All Fixes

1. Create user → Refresh → User persists ✅
2. Search user across roles → Found ✅
3. Create teacher with subjects → Saved ⏳
4. Teacher appears in timetable → Works ✅
5. Break time 10:00-10:40 → Correct ✅
6. Edit class → Works ✅
7. Send message → Count updates ⏳
8. Teacher dashboard → All classes show ⏳

## Priority

HIGH PRIORITY (Critical for functionality):
- Message sent count fix
- Teacher dashboard classes
- Universal search update

MEDIUM PRIORITY (Enhanced features):
- Teacher form fields
- Teacher update fields

The core persistence and search issues are FIXED ✅
The remaining are enhancements and UI fixes.
