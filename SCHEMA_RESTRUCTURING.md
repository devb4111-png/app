# Schema Restructuring: User → Schedule → Task

## Overview

The application now has a proper separation between user accounts and learning schedules. Users can register once and create multiple schedules, each with its own tasks and progress tracking.

---

## Data Model Architecture

```
User (Independent)
  ├── name
  ├── email
  ├── password (hashed)
  ├── schedules[] (references)
  └── createdAt, updatedAt

Schedule (Dependent on User)
  ├── userId (ref to User)
  ├── name
  ├── coreGoal
  ├── interests
  ├── pace (Slow, Steady, Sprint)
  ├── availability (days & hours)
  ├── tasks[] (references)
  ├── status (active, paused, completed, archived)
  ├── completionPercentage (0-100)
  ├── startDate
  ├── targetEndDate
  └── createdAt, updatedAt

Task (Dependent on Schedule & User)
  ├── scheduleId (ref to Schedule)
  ├── userId (ref to User)
  ├── title
  ├── description
  ├── estimatedMinutes
  ├── priority (high, medium, low)
  ├── status (pending, in-progress, completed)
  ├── originalDate
  ├── currentDate
  ├── postponeCount
  ├── completedAt
  └── createdAt, updatedAt
```

---

## API Endpoints

### User Endpoints (Existing)
```
POST   /api/auth/signup              Create new user
POST   /api/auth/[...nextauth]       Login user
```

### Schedule Endpoints (New)
```
GET    /api/schedules                Fetch all schedules for user
POST   /api/schedules                Create new schedule
GET    /api/schedules/[id]           Get schedule with tasks & stats
PATCH  /api/schedules/[id]           Update schedule
DELETE /api/schedules/[id]           Delete schedule & its tasks
```

### Task Endpoints (Updated)
```
GET    /api/tasks                    Fetch all tasks (with optional scheduleId filter)
GET    /api/tasks?scheduleId=[id]    Fetch tasks for specific schedule
PATCH  /api/tasks/[id]               Update task status or postpone
DELETE /api/tasks/[id]               Delete task
```

### Schedule Generation (Updated)
```
POST   /api/generate-schedule        Create schedule with AI-generated tasks
```

---

## Controllers

### `scheduleController.js`

**Functions:**
- `createSchedule(userId, scheduleData)` - Create new schedule for user
- `getUserSchedules(userId)` - Get all schedules for user
- `getScheduleWithTasks(scheduleId, userId)` - Get schedule with populated tasks
- `addTasksToSchedule(scheduleId, userId, tasks)` - Add tasks to schedule
- `updateScheduleStatus(scheduleId, userId, status)` - Update schedule status
- `updateScheduleCompletion(scheduleId)` - Calculate and update completion %
- `deleteSchedule(scheduleId, userId)` - Delete schedule and all its tasks
- `getScheduleStats(scheduleId, userId)` - Get schedule statistics

---

## Updated Database Models

### User Model (`src/lib/models/User.js`)

**Changes:**
- Removed: `coreGoal`, `interests`, `pace`, `availability`, `dailyPostponeCount`
- Added: `schedules[]` - array of Schedule references
- Purpose: Pure authentication/identity model

**Schema:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  schedules: [ObjectId] (ref Schedule),
  timestamps: true
}
```

### Schedule Model (`src/lib/models/Schedule.js`) - NEW

**Purpose:** Container for learning goals and tasks

**Schema:**
```javascript
{
  userId: ObjectId (ref User),
  name: String,
  coreGoal: String,
  interests: String,
  pace: String (Slow|Steady|Sprint),
  availability: [{day, start, end}],
  tasks: [ObjectId] (ref Task),
  status: String (active|paused|completed|archived),
  completionPercentage: Number (0-100),
  startDate: Date,
  targetEndDate: Date,
  dailyPostponeCount: {date, count},
  timestamps: true
}
```

### Task Model (`src/lib/models/Task.js`)

**Changes:**
- Added: `scheduleId` - reference to parent Schedule
- Updated indexes to include `scheduleId`
- Purpose: Tasks within a specific schedule

**Schema Changes:**
```javascript
{
  scheduleId: ObjectId (ref Schedule),  // NEW
  userId: ObjectId (ref User),
  title: String,
  description: String,
  estimatedMinutes: Number,
  priority: String,
  status: String,
  originalDate: Date,
  currentDate: Date,
  postponeCount: Number,
  completedAt: Date,
  timestamps: true
}
```

---

## Workflow Flows

### 1. User Registration Flow (Unchanged)
```
User visits /signup
  ↓
Enters: name, email, password
  ↓
POST /api/auth/signup
  ↓
User document created
  ↓
Redirect to /login
```

### 2. Schedule Generation Flow (New)
```
Authenticated user visits /schedule-setup
  ↓
Fills form: goal, interests, pace, availability
  ↓
POST /api/generate-schedule
  ├─ Create Schedule document
  ├─ Call Gemini AI for task generation
  ├─ Create Task documents (linked to Schedule)
  ├─ Add Schedule to User.schedules[]
  └─ Return populated Schedule with tasks
  ↓
Redirect to /dashboard
```

### 3. Multiple Schedules Flow (New)
```
User with existing schedule
  ↓
Can generate new schedule by visiting /schedule-setup
  ↓
Both schedules appear in dashboard
  ↓
User can switch between schedules
  ↓
Tasks organized by schedule
  ↓
Progress tracked per schedule + overall
```

### 4. Task Management Flow (Updated)
```
User views /dashboard
  ↓
Selects schedule (or views all)
  ↓
Can update task status
  ↓
PATCH /api/tasks/[id] with status change
  ↓
Schedule completion % auto-updates
  ↓
Overall progress recalculated
```

---

## Dashboard Changes

### Tabs Updated

1. **Overview Tab**
   - Overall stats (active schedules, total tasks, completion)
   - Selected schedule details
   - Upcoming tasks for selected schedule

2. **Schedules Tab** (Previously "Tasks")
   - List of all user schedules with progress
   - Click to select schedule
   - View tasks for selected schedule
   - Create new schedule button

3. **Progress Tab**
   - Overall completion circular chart
   - Statistics across all schedules
   - Task completion breakdown

4. **Settings Tab**
   - User account info (unchanged)
   - Create new schedule button

---

## Migration Guide

### For Existing Users

If migrating from old schema:

1. Create Schedule document for each user
   - Migrate user's: coreGoal, interests, pace, availability
   - Keep: userId, createdAt

2. Update all existing Tasks
   - Add: scheduleId (from newly created Schedule)
   - Keep: all other fields

3. Update User document
   - Remove: coreGoal, interests, pace, availability, dailyPostponeCount
   - Add: schedules array with Schedule._id

**Migration Script:**
```javascript
// Example migration
const users = await User.find();
for (const user of users) {
  // Create schedule from user data
  const schedule = new Schedule({
    userId: user._id,
    coreGoal: user.coreGoal,
    interests: user.interests,
    pace: user.pace,
    availability: user.availability,
  });
  await schedule.save();
  
  // Update tasks
  await Task.updateMany(
    { userId: user._id },
    { scheduleId: schedule._id }
  );
  
  // Update user
  await User.updateOne(
    { _id: user._id },
    { 
      $set: { schedules: [schedule._id] },
      $unset: { 
        coreGoal: 1, 
        interests: 1, 
        pace: 1, 
        availability: 1 
      }
    }
  );
}
```

---

## Key Benefits

### 1. Separation of Concerns
- User model purely for authentication
- Schedule model for learning goals
- Task model for individual activities

### 2. Multiple Schedules
- Users can create multiple schedules
- Switch between different learning goals
- Track progress separately

### 3. Better Data Organization
- Tasks clearly belong to schedules
- Easier to query: "tasks for this schedule"
- Cleaner relationships

### 4. Scalability
- Easy to add more schedule features (milestones, milestones, etc.)
- Support team collaboration on schedules (future)
- Archive old schedules without losing history

### 5. Analytics & Reporting
- Per-schedule statistics
- Compare multiple schedules
- Track trends across schedules

---

## Development Notes

### Creating Schedules
```javascript
// Backend
const schedule = await createSchedule(userId, {
  name: 'Python Mastery',
  coreGoal: 'Learn Python',
  interests: 'Web Development',
  pace: 'Steady',
  availability: [...]
});

// Frontend
const response = await fetch('/api/schedules', {
  method: 'POST',
  body: JSON.stringify(scheduleData)
});
```

### Fetching Schedules
```javascript
// All schedules
const response = await fetch('/api/schedules');
const schedules = await response.json();

// Single schedule with tasks
const response = await fetch(`/api/schedules/${scheduleId}`);
const { schedule, stats } = await response.json();
```

### Creating AI Schedule
```javascript
// Generates schedule + creates tasks
const response = await fetch('/api/generate-schedule', {
  method: 'POST',
  body: JSON.stringify({
    coreGoal: 'Learn Web Development',
    interests: 'React, Node.js',
    pace: 'Steady',
    availability: [...]
  })
});
const { schedule, taskCount } = await response.json();
```

### Querying Tasks by Schedule
```javascript
// Get tasks for specific schedule
const response = await fetch(`/api/tasks?scheduleId=${scheduleId}`);
const tasks = await response.json();

// Get tasks with status filter
const response = await fetch(
  `/api/tasks?scheduleId=${scheduleId}&status=pending`
);
```

---

## Files Changed/Created

### New Files
- `src/lib/models/Schedule.js` - Schedule schema
- `src/lib/controllers/scheduleController.js` - Schedule business logic
- `src/app/api/schedules/route.js` - Schedules endpoints
- `src/app/api/schedules/[id]/route.js` - Individual schedule endpoints

### Modified Files
- `src/lib/models/User.js` - Removed schedule fields, added schedules array
- `src/lib/models/Task.js` - Added scheduleId reference
- `src/app/api/generate-schedule/route.js` - Now creates Schedule + Tasks
- `src/app/api/tasks/route.js` - Updated with auth and scheduleId support
- `src/app/api/tasks/[id]/route.js` - Updated with auth and schedule updates
- `src/app/dashboard/page.jsx` - Now shows schedules and allows switching

---

## Testing Checklist

- [ ] User can signup and login
- [ ] User can generate new schedule
- [ ] Schedule appears in dashboard
- [ ] Can switch between schedules
- [ ] Tasks appear for selected schedule
- [ ] Task status updates work
- [ ] Completion % updates correctly
- [ ] Overall stats calculate properly
- [ ] Can delete schedule (and its tasks)
- [ ] Multiple schedules work together
- [ ] Progress is tracked per schedule
- [ ] API returns correct data with auth

---

## Future Enhancements

1. **Schedule Templates** - Pre-made schedule structures
2. **Collaborative Schedules** - Share schedules with others
3. **Schedule Analytics** - Charts, trends, insights
4. **Automatic Reschedule** - AI suggests new dates for missed tasks
5. **Schedule Cloning** - Duplicate a schedule for new goals
6. **Time Tracking** - Track actual time spent vs estimated
7. **Notifications** - Remind users of upcoming tasks
8. **Mobile App** - Native mobile access to schedules

---

## Version Info

- **Date:** March 11, 2026
- **Schema Version:** 2.0
- **Breaking Changes:** Yes (User model simplified)
- **Migration Required:** Yes (for existing data)
