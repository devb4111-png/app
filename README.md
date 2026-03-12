# AI Schedule Architect

AI Schedule Architect is a Next.js web application that leverages Google's Gemini AI to generate personalized, realistic learning and work schedules. By taking user inputs like core goals, learning pace, and availability, the platform builds an actionable task pipeline directly integrated into a user-friendly dashboard.

**Now with secure user authentication!** Users can create accounts and track their schedules with email/password login.

## 🚀 Features

- **🔐 Secure Authentication**: Email/password registration and login with bcrypt password hashing
- **AI-Powered Planning**: Uses Google's `gemini-1.5-flash` model to break down high-level goals into actionable, prioritized tasks.
- **Customizable Pace & Availability**: Adjusts schedule density based on user learning speed (Slow, Steady, Sprint) and explicitly provided time blocks.
- **Progress Tracking & Dashboard**: A visual dashboard to monitor completions, upcoming deadlines, and overall progress.
- **Goal Commitment System**: Smart limits on task postponements keep users accountable.
- **Persistent Storage**: MongoDB backend to save individual users, tasks, statuses, and history.

## 🏗️ Architecture

The project follows a standard Next.js App Router architecture with secure authentication via NextAuth.js, connecting a React front-end to a Next.js serverless API backend, which communicates with a MongoDB database and the Google Gemini API.

### Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Frontend**: React 19, Tailwind CSS
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with JWT sessions
- **Password Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: Google Generative AI (`@google/generative-ai`)
- **Icons**: React Icons

### Project Structure
```text
src/
├── app/
│   ├── api/                 # Next.js API Routes (Serverless Functions)
│   │   ├── auth/              # NextAuth configuration & signup
│   │   ├── generate-schedule/ # Endpoint to generate AI tasks
│   │   └── tasks/             # Endpoints for task CRUD operations
│   ├── login/               # Login page
│   ├── signup/              # User registration page
│   ├── dashboard/           # Protected dashboard page
│   ├── layout.jsx           # Root layout with AuthProvider
│   └── page.jsx             # Landing page
├── components/
│   ├── AuthProvider.jsx     # NextAuth SessionProvider wrapper
│   ├── LoginForm.jsx        # Login form component
│   ├── SignupForm.jsx       # Signup form component
│   ├── OnboardingForm.jsx   # Schedule onboarding form
│   └── ...
├── lib/
│   ├── models/
│   │   ├── User.js          # User schema with password hashing
│   │   └── Task.js          # Task schema
│   ├── gemini.js            # Gemini AI configuration
│   └── mongodb.js           # Database connection
├── utils/
│   └── validation.js        # Form validation helpers
└── middleware.js            # Route protection middleware
│   ├── dashboard/           # User dashboard page displaying tasks
│   ├── layout.jsx           # Root layout with global styles
│   └── page.jsx             # Landing page & Onboarding form
├── components/              # Reusable React Components
│   ├── GoalCommitmentAlert.jsx
│   ├── OnboardingForm.jsx
│   ├── ProgressBar.jsx
│   ├── Sidebar.jsx
│   ├── TaskCard.jsx
│   └── VibrantButton.jsx
├── lib/
│   ├── gemini.js            # Gemini AI configuration & prompt builder
│   ├── models/              # Mongoose Schemas (User, Task)
│   └── mongodb.js           # Database connection utility
└── utils/
    └── validation.js        # Form and data validation helpers
```

## 🔄 Application Flow

### 1. User Registration & Authentication
- User visits `http://localhost:3000/signup`
- Enters name, email, and password
- Form validates input (client & server)
- Password hashed with bcryptjs (10 rounds)
- User document created in MongoDB
- User redirected to `/login`

### 2. User Login
- User visits `http://localhost:3000/login`
- Enters email and password
- NextAuth verifies credentials
- JWT token issued and stored in secure cookie
- User redirected to `/` (authenticated)

### 3. Schedule Generation
- User fills onboarding form:
  - Core Goal (e.g., "Learn React")
  - Background/Interests (optional)
  - Learning Pace (Slow, Steady, Sprint)
  - Availability (time blocks per day)
- Form submits to `/api/generate-schedule`
- Server validates JWT authentication
- AI prompt built with user constraints
- Gemini API generates task list
- Tasks saved to MongoDB linked to user
- User redirected to `/dashboard`

### 4. Dashboard & Task Management
- Dashboard displays authenticated user's tasks
- Shows progress, stats, and task cards
- Users can:
  - Mark tasks as in-progress or completed
  - Postpone tasks (with daily limits)
  - Delete tasks
  - View detailed task information
- Logout button clears session and returns to home

## 🔐 Authentication & Security

The application uses **NextAuth.js** with JWT sessions for secure authentication:

- **Registration**: Email/password signup with password hashing
- **Login**: Secure credentials verification
- **Sessions**: JWT tokens in HTTP-only cookies
- **Route Protection**: Middleware enforces authentication on protected routes
- **Password Security**: bcryptjs hashing with 10 salt rounds
- **API Protection**: All sensitive endpoints require valid JWT

See [AUTHENTICATION.md](AUTHENTICATION.md) for detailed authentication documentation.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB cluster/URI
- A Google Gemini API Key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables. Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
   
   Generate NEXTAUTH_SECRET with:
   ```bash
   openssl rand -base64 32
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Create an account:
   - Click "Create Account" or visit `/signup`
   - Enter your name, email, and password
   - Click "Create Account"

6. Log in:
   - Visit `/login` or click "Log in" link
   - Enter your credentials
   - You'll be redirected to the onboarding form

7. Generate your first schedule:
   - Fill in your learning goal, pace, and availability
   - Click "Generate Schedule"
   - View your AI-generated tasks on the dashboard

## 🛡️ Database Models

- **User**: Stores user info (name, email, hashed password), goals, pace, availability, and daily postponement counts
- **Task**: Associated with a specific `userId`. Stores task title, description, estimated time, priority, status, and dates to track postponements.

## 📚 Documentation

- [AUTHENTICATION.md](AUTHENTICATION.md) - Complete authentication guide
- [AUTH_SETUP.md](AUTH_SETUP.md) - Quick start for authentication
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture & flow diagrams
- [CHECKLIST.md](CHECKLIST.md) - Implementation checklist

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.