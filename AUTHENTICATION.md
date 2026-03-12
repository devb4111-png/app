# Authentication Implementation Guide

## Overview

The AI Schedule Architect application now includes a complete authentication system using **NextAuth.js** with email/password credentials. Users must register and log in to access the schedule generation and tracking features.

## Authentication Architecture

### Technology Stack
- **NextAuth.js**: JWT-based session management
- **bcryptjs**: Secure password hashing
- **MongoDB**: User credential storage

### Flow Diagram
```
User Registration (Sign Up)
    ↓
Email + Password → Hash with bcrypt → Store in MongoDB
    ↓
User Login
    ↓
Email + Password → Verify with stored hash → Generate JWT
    ↓
NextAuth Session Created
    ↓
Access Dashboard → Middleware checks JWT → Protected routes unlock
```

## How It Works

### 1. User Registration (`/signup`)

**Flow:**
1. User visits `/signup` page
2. Fills out: Name, Email, Password, Confirm Password
3. Form validates client-side (password >= 6 chars, match, etc.)
4. POST request sent to `/api/auth/signup`
5. Server validates input again
6. Email uniqueness checked in MongoDB
7. Password hashed with bcryptjs (10 salt rounds)
8. User document created with default `coreGoal` and empty `availability`
9. User redirected to `/login`

**User Model Updates:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed, never sent to client),
  coreGoal: String,
  interests: String,
  pace: Enum ['Slow', 'Steady', 'Sprint'],
  availability: [{ day, start, end }],
  createdAt: Date,
  updatedAt: Date
}
```

### 2. User Login (`/login`)

**Flow:**
1. User enters email + password
2. POST to `/api/auth` (NextAuth credentials provider)
3. Server queries User by email
4. Password compared with stored hash using `bcrypt.compare()`
5. On success: JWT token generated with user ID
6. User redirected to `/dashboard`
7. On failure: Error message displayed

### 3. Session Management

**Files Involved:**
- `src/app/api/auth/route.js` - NextAuth configuration
- `src/components/AuthProvider.jsx` - SessionProvider wrapper
- `middleware.js` - Route protection

**Session Token Contains:**
```javascript
{
  id: user._id,      // MongoDB user ID
  email: user.email,
  name: user.name
}
```

### 4. Protected Routes

**Middleware Protection (`middleware.js`):**
- Checks JWT token on every request
- Allows: `/`, `/login`, `/signup` (public)
- Protects: `/dashboard`, `/api/tasks`, `/api/generate-schedule` (private)
- Redirects unauthenticated users to `/login`

**Component-Level Protection:**
- `OnboardingForm` uses `useSession()` to access user info
- `Dashboard` redirects to `/login` if `status === 'unauthenticated'`

## Updated API Endpoints

### `/api/auth/signup` (POST)
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "passwordConfirm": "securePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please log in.",
  "userId": "507f1f77bcf86cd799439011"
}
```

### `/api/auth` (POST)
Login with credentials. Handled by NextAuth internally.

**Request (via signIn()):**
```javascript
signIn('credentials', {
  email: 'john@example.com',
  password: 'securePass123'
})
```

### `/api/generate-schedule` (POST)
Now requires authentication. Returns 401 if not logged in.

**Changes:**
- Removed: `name`, `email` fields (now from session)
- Added: JWT token validation
- Uses: `session.user.id` to link tasks to authenticated user

**Request:**
```json
{
  "coreGoal": "Learn Backend Development",
  "interests": "Already know JavaScript",
  "pace": "Steady",
  "availability": [
    { "day": "Monday", "start": "09:00", "end": "11:00" }
  ]
}
```

## Updated Pages

### `/` (Home)
- Shows auth links (Login / Sign Up) for unauthenticated users
- Redirects authenticated users to `/dashboard`
- Displays onboarding form only after authentication

### `/login` (New)
- Email + password login form
- Links to sign up page
- Redirects to dashboard on success

### `/signup` (New)
- Name, email, password registration form
- Password confirmation validation
- Links to login page

### `/dashboard`
- Requires authentication (middleware redirect)
- Displays logout button in header
- Uses `session.user.name` for greeting
- Fetches tasks using authenticated user ID

## Security Features

1. **Password Hashing**
   - bcryptjs with 10 salt rounds
   - Passwords never stored in plain text
   - `select: false` prevents accidental leaks

2. **JWT Tokens**
   - Signed with NEXTAUTH_SECRET
   - Configurable expiration
   - HTTPS-only cookies (in production)

3. **Session Validation**
   - Middleware checks token on every protected route
   - Expired tokens redirect to login
   - User ID embedded in token prevents ID tampering

4. **Input Validation**
   - Client-side: Real-time feedback
   - Server-side: All inputs re-validated
   - Unique email check before registration

## Environment Variables Required

Add these to `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Google Gemini
GEMINI_API_KEY=your_api_key

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Installation & Setup

1. **Install dependencies** (already done):
   ```bash
   npm install next-auth bcryptjs
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Fill in MONGODB_URI, GEMINI_API_KEY, NEXTAUTH_SECRET
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Test the flow**:
   - Visit `http://localhost:3000/signup`
   - Create an account
   - Log in at `http://localhost:3000/login`
   - Generate a schedule
   - View in dashboard
   - Click logout to end session

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── route.js          # NextAuth handler
│   │   │   └── signup/
│   │   │       └── route.js      # Registration endpoint
│   │   ├── generate-schedule/
│   │   │   └── route.js          # Now auth-protected
│   │   └── tasks/
│   │       └── route.js          # Now auth-protected
│   ├── login/
│   │   └── page.jsx              # Login page
│   ├── signup/
│   │   └── page.jsx              # Signup page
│   ├── dashboard/
│   │   └── page.jsx              # Auth-required dashboard
│   ├── page.jsx                  # Updated home
│   └── layout.jsx                # Added AuthProvider
├── components/
│   ├── AuthProvider.jsx          # NEW: SessionProvider wrapper
│   ├── LoginForm.jsx             # NEW: Login form
│   ├── SignupForm.jsx            # NEW: Signup form
│   └── OnboardingForm.jsx        # Updated: Uses session
├── lib/
│   ├── models/
│   │   └── User.js               # Updated: Added password + bcrypt
│   └── ...
└── middleware.js                 # NEW: Route protection
```

## Common Tasks

### How to Log Out
```javascript
import { signOut } from 'next-auth/react';

// In a component
<button onClick={() => signOut({ redirect: true, callbackUrl: '/' })}>
  Logout
</button>
```

### How to Access Current User
```javascript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();

if (status === 'authenticated') {
  console.log(session.user.id, session.user.email, session.user.name);
}
```

### How to Check Authentication in API Routes
```javascript
import { getServerSession } from 'next-auth';
import { handler as authHandler } from '@/app/api/auth/route';

export async function POST(request) {
  const session = await getServerSession(authHandler);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Proceed with authenticated user
  const userId = session.user.id;
}
```

## Troubleshooting

**"Unauthorized" on dashboard:**
- Check if user is logged in (look for token in cookies)
- Verify NEXTAUTH_SECRET is set in .env.local
- Clear browser cookies and try again

**"User already exists":**
- Email already registered with different password
- Try logging in instead of signing up

**Password not matching:**
- Ensure bcryptjs is installed
- Check bcrypt import in User.js model

**Session not persisting:**
- NEXTAUTH_SECRET must be set
- Cookies should be enabled in browser
- Check middleware.js matches your route names

## Future Enhancements

- Password reset via email
- OAuth providers (Google, GitHub)
- Two-factor authentication
- User profile editing
- Password change functionality
