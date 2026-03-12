# Architecture & Authentication Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Login, Signup, Dashboard, Home                          │
│  Uses: next-auth/react (useSession, signIn, signOut)           │
│  Session stored in: Secure HTTP-only cookies                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS with JWT
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS SERVER LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Middleware (middleware.js)                                  │ │
│  │ - Validates JWT on every request                           │ │
│  │ - Redirects to /login if unauthorized                      │ │
│  │ - Allows public routes (/, /login, /signup)               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ NextAuth Handler (/api/auth)                               │ │
│  │ - CredentialsProvider (email/password)                    │ │
│  │ - Validates credentials against DB                        │ │
│  │ - Issues JWT token on success                             │ │
│  │ - Manages sessions (cookie-based)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ API Routes (Protected by middleware)                       │ │
│  │ - /api/auth/signup → Create new user                      │ │
│  │ - /api/generate-schedule → Generate AI schedule           │ │
│  │ - /api/tasks/* → Manage tasks                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Mongoose queries
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│  - users (name, email, password_hash, goals, etc.)            │
│  - tasks (userId, title, description, status, etc.)           │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Authentication Sequence Diagram

```
SIGNUP FLOW:
═══════════

User                SignupForm              /api/auth/signup        MongoDB
  │                     │                          │                   │
  ├─ Fill form ────────→│                          │                   │
  │                     ├─ POST (name, email, pwd) │                   │
  │                     ├────────────────────────→│                    │
  │                     │                          │                   │
  │                     │                          ├─ Hash password     │
  │                     │                          ├─ Check email unique│
  │                     │                          ├─ Create user       │
  │                     │                          ├──────────────────→│
  │                     │                          │  Insert user doc   │
  │                     │                          │←──────────────────┤
  │                     │←────────────────────────┤                    │
  │                     │   201 + Success msg      │                    │
  │←────────────────────┤                          │                    │
  └─ Redirect to login  │                          │                    │


LOGIN FLOW:
══════════

User                LoginForm           NextAuth /api/auth        MongoDB
  │                     │                          │                   │
  ├─ Email + pwd ──────→│                          │                   │
  │                     ├─ POST credentials        │                   │
  │                     ├────────────────────────→│                    │
  │                     │                          ├─ Query user       │
  │                     │                          ├──────────────────→│
  │                     │                          │←──────────────────┤
  │                     │                          │   User doc        │
  │                     │                          │                   │
  │                     │                          ├─ Compare password │
  │                     │                          │   with bcrypt     │
  │                     │                          │                   │
  │                     │                          ├─ Generate JWT     │
  │                     │←────────────────────────┤                    │
  │                     │   JWT token (in cookie)  │                    │
  │←────────────────────┤                          │                    │
  └─ Set cookie         │                          │                    │
  └─ Redirect to /      │                          │                    │


ACCESSING DASHBOARD:
════════════════════

User                Browser Middleware       NextAuth           Dashboard
  │                     │                        │                  │
  ├─ Visit /dashboard  ─┼────────────────────────→│                 │
  │                     │                        │                  │
  │                     ├─ Extract JWT from cookie                  │
  │                     ├─ Validate JWT signature                   │
  │                     ├─ Verify not expired                       │
  │                     │                        │                  │
  │                     ├─ JWT valid ──────────→│                  │
  │                     │                        ├─ Check session  │
  │                     │                        │  middleware      │
  │                     │                        ├─ Extract userId │
  │                     │                        │                  │
  │                     │←───────────────────────┤                  │
  │                     │   Pass through + userId│                  │
  │                     │                        │                  │
  │←──────────────────────────────────────────────┤                  │
  │   Load dashboard with session.user data      │                  │
  │   (name, email, id)                          │                  │
  └─ Display dashboard ──────────────────────────→│
                                                  ├─ useSession()
                                                  ├─ Render with user info
                                                  ├─ Fetch tasks using userId
                                                  └─ Show logout button
```

## 3. Password Hashing Flow

```
REGISTRATION:
═════════════

Password Input: "MySecurePassword123"
        │
        ▼
   Generate Salt (bcryptjs)
   - Random 10 rounds
        │
        ▼
   Hash = bcrypt("MySecurePassword123", salt)
   Result: "$2b$10$kR9.8uu9QZSgN5wT3h...xyz" (60 chars)
        │
        ▼
   Store in MongoDB:
   {
     _id: ObjectId,
     email: "user@example.com",
     password: "$2b$10$kR9.8uu9QZSgN5wT3h...xyz",  ← Hashed
     name: "John"
   }


LOGIN:
══════

Password Input: "MySecurePassword123"
        │
        ▼
   Fetch user from DB:
   { password: "$2b$10$kR9.8uu9QZSgN5wT3h...xyz" }
        │
        ▼
   Compare: bcrypt.compare(input, stored)
   - Extracts salt from stored hash
   - Re-hashes input with same salt
   - Compares result with stored hash
        │
        ▼
   ┌──────────────────┐
   │  Match = true?   │
   └────────┬─────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
   YES            NO
    │              │
    ▼              ▼
  Grant        Reject
  JWT           Login
```

## 4. Request Protection via Middleware

```
Incoming Request
     │
     ▼
┌─────────────────────────┐
│ middleware.js           │
│ - Check URL path        │
└──────────┬──────────────┘
           │
    ┌──────┴─────────┐
    ▼                ▼
Public Route?   Protected Route?
  (/, /login,    (/dashboard,
   /signup)      /api/tasks, etc)
    │                │
    │                ▼
    │            Extract JWT
    │            from cookie
    │                │
    │                ▼
    │            Verify with
    │            NEXTAUTH_SECRET
    │                │
    │         ┌──────┴──────┐
    │         ▼             ▼
    │      Valid?         Invalid?
    │         │             │
    │         ▼             ▼
    │       Pass        Redirect
    │     Through         to
    │        to          /login
    │      Handler
    │         │
    └─────┬───┘
          │
          ▼
    Continue to
    API route or
    page component
```

## 5. Session State Management

```
Global Session State (via AuthProvider):
═════════════════════════════════════════

<html>
  <body>
    <AuthProvider>           ← SessionProvider from next-auth
      <Middleware/>          ← Validates JWT
      <RootLayout>
        <Page/>
          <Component/>
            │
            └─ useSession() hook
               │
               ▼
            {
              data: {
                user: {
                  id: "507f1f77bcf86cd799439011",
                  email: "john@example.com",
                  name: "John Doe"
                },
                expires: "2024-04-11T12:00:00Z"
              },
              status: "authenticated" | "loading" | "unauthenticated"
            }
```

## 6. Data Flow: Register → Login → Create Schedule

```
Step 1: REGISTRATION
─────────────────────
User fills signup form
    ↓
POST /api/auth/signup
    ↓
Create user with hashed password
    ↓
User redirected to /login


Step 2: LOGIN
─────────────
User fills login form
    ↓
POST /api/auth (NextAuth)
    ↓
Query user by email
    ↓
Verify password with bcrypt.compare()
    ↓
Generate & sign JWT
    ↓
Set HTTP-only cookie with token
    ↓
User redirected to / (authenticated)


Step 3: ONBOARDING
──────────────────
User fills onboarding form:
- Core Goal: "Learn React"
- Pace: "Steady"
- Availability: [...]
    ↓
POST /api/generate-schedule
    ↓
Middleware validates JWT
    ↓
Extract session.user.id
    ↓
Send to Gemini with user constraints
    ↓
Gemini returns task list
    ↓
Create Task documents linked to user
    ↓
Save to MongoDB
    ↓
User redirected to /dashboard


Step 4: DASHBOARD
─────────────────
Load /dashboard
    ↓
Middleware validates JWT
    ↓
Client: useSession() gets user info
    ↓
Fetch /api/tasks?userId={sessionUserId}
    ↓
Display tasks specific to user
    ↓
User can manage tasks
    ↓
Click logout → signOut()
    ↓
Clear session + JWT cookie
    ↓
Redirect to /
```

## 7. JWT Token Structure

```
JWT Format: Header.Payload.Signature

Example Decoded Payload:
──────────────────────
{
  "sub": "507f1f77bcf86cd799439011",  ← user._id
  "email": "john@example.com",
  "name": "John Doe",
  "iat": 1710000000,                  ← Issued at
  "exp": 1712592000,                  ← Expires in 30 days
  "jti": "xxxxxx"                     ← Token ID
}

Verification:
─────────────
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  NEXTAUTH_SECRET
) === signature

If signature valid + not expired → Trusted
```

---

For more details, see:
- `AUTHENTICATION.md` - Complete guide
- `AUTH_SETUP.md` - Quick start
