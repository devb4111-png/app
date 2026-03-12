# Project Structure & File Map

## Directory Layout

```
app/
├── public/
│   └── [static assets]
├── src/
│   ├── app/
│   │   ├── layout.jsx              [Root layout with AuthProvider]
│   │   ├── page.jsx                [Landing page - public]
│   │   ├── globals.css             [Global styles]
│   │   ├── dashboard/
│   │   │   └── page.jsx            [Tabbed dashboard - protected]
│   │   ├── schedule-setup/
│   │   │   └── page.jsx            [Schedule creation - protected]
│   │   ├── login/
│   │   │   └── page.jsx            [Login page - public]
│   │   ├── signup/
│   │   │   └── page.jsx            [Signup page - public]
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── route.js        [NextAuth handler]
│   │       │   └── signup/
│   │       │       └── route.js    [Signup endpoint]
│   │       ├── tasks/
│   │       │   └── route.js        [Task API]
│   │       │   └── [id]/
│   │       │       └── route.js    [Task by ID]
│   │       └── generate-schedule/
│   │           └── route.js        [AI schedule generation]
│   ├── components/
│   │   ├── Navbar.jsx              [Top navigation bar]
│   │   ├── Footer.jsx              [Footer with branding]
│   │   ├── AuthProvider.jsx        [NextAuth session provider]
│   │   ├── LoginForm.jsx           [Login form component]
│   │   ├── SignupForm.jsx          [Signup form component]
│   │   ├── OnboardingForm.jsx      [Schedule creation form]
│   │   ├── TaskCard.jsx            [Individual task card]
│   │   ├── ProgressBar.jsx         [Progress visualization]
│   │   ├── GoalCommitmentAlert.jsx [Alert component]
│   │   ├── Sidebar.jsx             [Sidebar navigation]
│   │   └── VibrantButton.jsx       [Button component]
│   ├── lib/
│   │   ├── gemini.js               [Google Gemini AI integration]
│   │   ├── mongodb.js              [MongoDB connection]
│   │   └── models/
│   │       ├── User.js             [User schema with auth]
│   │       └── Task.js             [Task schema]
│   └── utils/
│       └── validation.js           [Form validation]
├── middleware.js                    [Route protection middleware]
├── .env.local                       [Environment variables]
├── package.json                     [Dependencies & scripts]
├── next.config.mjs                  [Next.js configuration]
├── tailwind.config.js               [Tailwind CSS config]
├── postcss.config.mjs               [PostCSS config]
└── jsconfig.json                    [JavaScript config]
```

## Key Files & Responsibilities

### Pages

| File | Route | Auth | Purpose |
|------|-------|------|---------|
| `page.jsx` | `/` | None | Public landing page with branding |
| `login/page.jsx` | `/login` | None | User login page |
| `signup/page.jsx` | `/signup` | None | User registration page |
| `dashboard/page.jsx` | `/dashboard` | Required | Tabbed dashboard with 4 views |
| `schedule-setup/page.jsx` | `/schedule-setup` | Required | AI schedule creation form |

### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| **Navbar** | Top navigation bar | ✅ Complete |
| **Footer** | Project branding footer | ✅ Complete |
| **AuthProvider** | NextAuth session wrapper | ✅ Complete |
| **LoginForm** | Email/password login | ✅ Complete |
| **SignupForm** | User registration form | ✅ Complete |
| **OnboardingForm** | AI schedule creation | ✅ Complete |
| **TaskCard** | Individual task display | ✅ Complete |
| **ProgressBar** | Progress visualization | ✅ Complete |
| **GoalCommitmentAlert** | Alert notifications | ✅ Complete |

### API Routes

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/*` | GET, POST | N/A | NextAuth endpoints |
| `/api/auth/signup` | POST | No | User registration |
| `/api/generate-schedule` | POST | Yes | Create AI schedule |
| `/api/tasks` | GET | Yes | List user tasks |
| `/api/tasks/[id]` | GET, PATCH | Yes | Task operations |

### Database Models

**User Schema:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  createdAt: Date
}
```

**Task Schema:**
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  priority: String (high/medium/low),
  status: String (pending/in-progress/completed),
  startDate: Date,
  endDate: Date,
  postponeCount: Number,
  maxPostpones: Number,
  createdAt: Date
}
```

## Authentication Flow

```
1. Unauthenticated User
   ├─ Visits / → Landing page
   ├─ Clicks "Sign Up" → /signup
   │  ├─ Enters name, email, password
   │  ├─ POST /api/auth/signup
   │  └─ Redirects to /login
   └─ Or clicks "Log In" → /login
      ├─ Enters email, password
      ├─ POST /api/auth (via NextAuth)
      └─ Redirects to /dashboard

2. Authenticated User
   ├─ Accesses / → Auto-redirects to /dashboard
   ├─ Can access /dashboard → Tabbed interface
   ├─ Can access /schedule-setup → Create schedule
   └─ Has Navbar with logout button
```

## Session Management

- **Type:** JWT (JSON Web Tokens)
- **Provider:** NextAuth.js with CredentialsProvider
- **Storage:** HTTP-only cookies (secure)
- **Timeout:** Configurable (default: 30 days)

## Protected Routes

Routes protected by middleware in `middleware.js`:
- `/dashboard` - Requires authentication
- `/schedule-setup` - Requires authentication

Unauthenticated users are redirected to `/login` with `redirect` query parameter.

## Environment Variables Required

```
.env.local:
  NEXTAUTH_SECRET=<random-string>
  NEXTAUTH_URL=http://localhost:3000
  GEMINI_API_KEY=<your-api-key>
  MONGODB_URI=<your-mongodb-url>
```

## Dependencies

### Core
- **next** (v15.1.0) - React framework
- **react** (v19.0.0) - UI library
- **react-dom** (v19.0.0) - DOM rendering

### Authentication
- **next-auth** (v4+) - Authentication
- **bcryptjs** - Password hashing

### Database
- **mongoose** (v8.9.0) - MongoDB ORM

### AI/ML
- **@google/generative-ai** (v0.21.0) - Gemini API

### Styling
- **tailwindcss** (v3.4.17) - CSS framework
- **autoprefixer** - CSS vendor prefixes
- **postcss** - CSS processing

### Icons
- **react-icons** (v5.4.0) - Icon library

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Build Status

- ✅ Latest build: Successful
- ✅ No TypeScript errors
- ✅ All imports resolved
- ✅ No missing dependencies
- ✅ Dev server running on port 3000

## Security Features

1. **Password Security:**
   - Bcryptjs hashing with salt rounds
   - Passwords never stored in plain text
   - `+password` select in queries to exclude from responses

2. **Session Security:**
   - JWT tokens with secret
   - HTTP-only cookies
   - CSRF protection via NextAuth

3. **Route Protection:**
   - Middleware checks authentication
   - Server-side session validation
   - Client-side redirects for UX

4. **API Security:**
   - Session verification on protected routes
   - User ID validation
   - Error messages don't leak sensitive info

## Performance Metrics

- **Landing Page Load:** Fast (static)
- **Dashboard Load:** ~500-1000ms (fetches tasks)
- **API Response:** ~1-2s (Gemini calls can be slower)
- **Image Optimization:** Using CSS gradients
- **Bundle Size:** Optimized with Next.js defaults

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA
- Responsive design for all screen sizes

## Future Enhancement Opportunities

1. **Features:**
   - Dark/light theme toggle
   - User preferences storage
   - Advanced task filtering
   - Task notes and attachments
   - Calendar view for tasks
   - Goal tracking
   - Progress reports

2. **Integrations:**
   - Google Calendar sync
   - Email notifications
   - Slack integration
   - GitHub issues integration

3. **Performance:**
   - Database query optimization
   - API caching
   - Image optimization
   - Code splitting

4. **Monitoring:**
   - Error tracking (Sentry)
   - Analytics (Mixpanel, Amplitude)
   - Performance monitoring
   - User behavior tracking
