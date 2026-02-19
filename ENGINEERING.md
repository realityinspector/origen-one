# SUNSCHOOL Engineering Documentation

## Overview

SUNSCHOOL is an AI-powered educational platform built with React Native Web and Express.js. This document contains validated technical information about the actual implementation.

## Architecture

### Tech Stack

**Frontend:**
- React 19.1.0 with TypeScript
- React Native Web for cross-platform compatibility
- React Query for data fetching and caching
- Wouter for client-side routing
- Vite for build tooling

**Backend:**
- Node.js with Express.js 5.1.0
- TypeScript for type safety
- JWT authentication with role-based access control
- Drizzle ORM with PostgreSQL

**Database:**
- PostgreSQL (Neon serverless)
- Drizzle ORM for schema management
- JSONB fields for complex data structures

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'LEARNER', -- ADMIN, PARENT, LEARNER
  password TEXT, -- For non-OAuth users
  parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Learner Profiles
```sql
CREATE TABLE learner_profiles (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL,
  graph JSON, -- Knowledge graph structure
  subjects JSON DEFAULT '["Math", "Science"]',
  subject_performance JSON DEFAULT '{}',
  recommended_subjects JSON DEFAULT '[]',
  struggling_areas JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Lessons
```sql
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status lesson_status DEFAULT 'QUEUED', -- QUEUED, ACTIVE, DONE
  subject TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'beginner',
  image_paths JSON, -- Basic image storage
  spec JSON, -- Lesson content specification
  enhanced_spec JSON, -- Extended lesson format (sections, images, diagrams)
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### Achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSON, -- Achievement details (title, description, icon)
  awarded_at TIMESTAMP DEFAULT NOW()
);
```

#### Database Sync Configuration
```sql
CREATE TABLE db_sync_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_db_url TEXT NOT NULL,
  last_sync_at TIMESTAMP,
  sync_status sync_status DEFAULT 'IDLE', -- IDLE, IN_PROGRESS, FAILED, COMPLETED
  continuous_sync BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

#### Quiz Answers (Phase 2 Analytics)
```sql
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_hash TEXT NOT NULL, -- SHA-256 hash for deduplication
  user_answer INTEGER NOT NULL,
  correct_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  concept_tags TEXT[] DEFAULT '{}', -- Array of concept tags (e.g., 'addition', 'subtraction')
  answered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_answers_learner ON quiz_answers(learner_id);
CREATE INDEX idx_quiz_answers_hash ON quiz_answers(question_hash);
CREATE INDEX idx_quiz_answers_concepts ON quiz_answers USING GIN(concept_tags);
```

#### Question Deduplication
Question deduplication is handled in-memory by the `question-deduplication.ts` service using SHA-256 hashing of the `question_hash` field in the `quiz_answers` table. There is no separate `questions_history` table.

#### Points Tracking
Points are tracked via the `points-service.ts` service. Point balances and history are served through the `/api/points/balance` and `/api/learner/:learnerId/points-history` endpoints.

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /user` - Get current user info

### User Management (Role-based)
- `GET /api/parents` - List parents (ADMIN only)
- `GET /api/learners` - List learners (PARENT, ADMIN)
- `POST /api/learners` - Create learner (PARENT, ADMIN)
- `DELETE /api/learners/:id` - Delete learner (PARENT, ADMIN)
- `GET /api/learner-profile/:userId` - Get learner profile
- `PUT /api/learner-profile/:userId` - Update learner profile (PARENT, ADMIN)

### Lessons
- `POST /api/lessons/create` - Create new lesson (supports `learnerId` in body for parent-as-learner mode)
- `GET /api/lessons/active` - Get active lesson (supports `?learnerId=` query param for parent-as-learner mode)
- `GET /api/lessons/:lessonId` - Get specific lesson
- `GET /api/lessons` - List lessons
- `POST /api/lessons/:lessonId/answer` - Submit lesson answers

### Achievements
- `GET /api/achievements` - Get user achievements

### Analytics & Performance (Phase 2)
- `GET /api/learner/:learnerId/concept-performance` - Get concept mastery analytics
- `GET /api/learner/:learnerId/recent-answers` - Get recent quiz answers (limit 50)
- `GET /api/learner/:learnerId/points-history` - Get points history

### Database Sync (Parent only)
- `GET /api/sync-configs` - List sync configurations
- `GET /api/sync-configs/:id` - Get sync config details
- `POST /api/sync-configs` - Create sync configuration
- `PUT /api/sync-configs/:id` - Update sync configuration
- `DELETE /api/sync-configs/:id` - Delete sync configuration
- `POST /api/sync-configs/:id/push` - Trigger manual sync

### Reporting & Export
- `GET /api/reports` - Get user reports
- `GET /api/export` - Export user data (PARENT, ADMIN)

### Health Check
- `GET /api/healthcheck` - Basic health check

## Authentication System

### JWT Implementation
- Stateless authentication using JSON Web Tokens
- Role-based access control (ADMIN, PARENT, LEARNER)
- Session management with express-session
- Password hashing with scrypt

### User Roles & Permissions

**ADMIN:**
- Full access to all endpoints
- Can manage all users and data
- Can view system-wide analytics

**PARENT:**
- Can manage their linked learner accounts
- Can view learner progress and achievements
- Can configure database sync settings
- Cannot access other parents' data

**LEARNER:**
- Can access assigned lessons
- Can view personal achievements
- Limited to own data only

## Data Flow

### Lesson Creation Process
1. User requests lesson creation via API (with `learnerId` for parent-as-learner mode)
2. Backend validates permissions (parent can create for their children)
3. Backend generates lesson content using OpenRouter AI with SVG illustrations
4. Lesson stored in database with status 'ACTIVE'
5. Frontend retrieves and displays lesson with embedded SVG images
6. User completes lesson and submits quiz answers
7. Backend calculates score and updates lesson status

### Parent-as-Learner Mode
Parents can switch to "Learner Mode" to view their children's lessons:
1. Parent clicks "Go to Sunschool Learner Mode" on the dashboard
2. Parent selects a child learner from the picker
3. Frontend sends requests with the child's `learnerId`
4. `/api/lessons/create` uses `learnerId` from request body (not `req.user.id`)
5. `/api/lessons/active` uses `learnerId` from query parameter

### Database Sync Process
1. Parent configures external PostgreSQL connection
2. System validates connection and stores configuration
3. Parent initiates manual sync or enables continuous sync
4. Backend performs one-way data replication to external database
5. Sync status tracked and reported to user

## Development Scripts

### Database Management
- `npm run migrate` - Apply database migrations (also runs automatically on server startup)
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:generate` - Generate migration files
- `npm run db:seed` - Populate with sample data

### User Management
- `ts-node scripts/admin-onboard.ts` - Create initial admin user
- `ts-node scripts/reset-password.ts` - Reset user passwords

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy with TypeScript compilation

## Environment Configuration

### Required Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
OPENROUTER_API_KEY=your-openrouter-key
PERPLEXITY_API_KEY=your-perplexity-key
PORT=5000
```

### Optional Environment Variables
```env
NODE_ENV=development|production
USE_AI=1|0  # Enable/disable AI features
```

## Phase 2 Analytics Features (Implemented)

### Quiz Tracking System
- **Individual Answer Storage**: Every quiz answer stored with metadata
- **Question Deduplication**: SHA-256 hashing prevents duplicate questions
- **Concept Tagging**: Automatic extraction of educational concepts (addition, subtraction, plants, animals, etc.)
- **Performance Analytics**: Track accuracy per concept for adaptive learning

### Concept Mastery
- Aggregated performance data across all concepts
- Accuracy percentage for each educational concept
- Total attempts and correct answers tracked
- Supports subjects: Math, Science, Reading/Language, Cognitive Skills

### Points System
- Points awarded for lesson completion
- Bonus points for perfect quiz scores
- Full points history with reasons and timestamps
- Integrated with gamification system

### Content Validation
- Age-appropriate content checking
- Word count limits per grade level
- Complexity validation
- Tone and vocabulary appropriateness

## Known Limitations

### Not Yet Implemented
- Continuous database synchronization (manual sync works)
- Real-time collaborative features

### Partially Implemented
- Interactive knowledge graphs (basic component exists with zoom controls; not fully featured)
- Subject recommendations (category mapping service exists; full adaptive recommendation algorithm pending)
- Automatic lesson generation after quiz completion (temporarily disabled pending migration stability)

### Current Constraints
- Manual database sync process
- Automatic lesson generation feature temporarily disabled pending migration stability

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
The application can be containerized but requires PostgreSQL database setup.

### Environment Setup
1. Configure PostgreSQL database (Neon serverless recommended)
2. Set environment variables in `.env` file
3. Database migrations run automatically on server startup
4. Create initial admin user (automatic on first run, credentials saved to `admin-credentials.txt`)
5. Start application server

### Migration Process
- Migrations are automatically applied on server startup
- Migration failures do not prevent server startup (prevents deployment failures)
- Migrations folder: `drizzle/migrations/`
- Manual migration: `npm run migrate`

### Database Connection
- Uses Neon serverless PostgreSQL with WebSocket connections
- Connection pooling configured for production (max 10 connections)
- Keep-alive pings every 2 minutes to maintain connection
- Automatic retry logic with exponential backoff
- SSL enabled for production environments

## Testing

### Available Tests
- Unit tests with Jest
- End-to-end tests with Playwright (comprehensive child lesson flow)
- Database sync testing script

### Test Scripts
- `npm test` - Run unit tests
- `npx playwright test` - Run e2e tests (local server)
- `PLAYWRIGHT_BASE_URL=https://sunschool.xyz npx playwright test` - Run e2e tests against production
- `./test-db-sync.sh` - Test database synchronization

### E2E Test: Child Lesson Flow (`tests/e2e/child-lesson-flow.spec.ts`)

Full integration test covering the complete user journey:

| Step | What it tests |
|------|---------------|
| Register parent | API registration with UI login fallback |
| Add child | Child creation with grade picker |
| Switch to learner mode | Parent dashboard to learner view navigation |
| Generate lesson | "Random Lesson" click, AI lesson generation, polling for completion |
| View lesson | Lesson content rendering with SVGs and images |
| Take quiz | DOM-based quiz option selection across 3 questions |
| Submit quiz | "I'm Done!" submission and results display |
| Return home | Navigation back to learner home |

**Configuration** (`playwright.config.ts`):
- Viewport: 1280x900
- Timeout: 10 minutes (AI lesson generation is slow)
- Screenshots saved to `tests/e2e/screenshots/`
- Auto-starts local server when targeting localhost

## Monitoring & Debugging

### Logging
- Console logging throughout application
- Database query logging in development
- Error tracking with stack traces

### Health Checks
- `/api/healthcheck` endpoint for basic monitoring
- Database connectivity verification
- Memory and performance monitoring

### Troubleshooting Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` environment variable is set correctly
- Check Neon dashboard for database status
- WebSocket constructor is automatically configured for Neon
- Connection pool errors may indicate too many concurrent connections

**Migration Failures**
- Check `drizzle/migrations/` folder exists
- Verify database user has CREATE TABLE permissions
- Migration errors are logged but don't prevent server startup
- Run `npm run migrate` manually to debug specific migration issues

**Quiz Submission Errors**
- Ensure `quiz_answers` table exists (run migrations)
- Check that learner has an active lesson
- Verify question format matches expected structure
- Look for constraint violations in database logs

**Type Errors During Build**
- Run `npx tsc --noEmit` to check for type errors
- Ensure all dependencies are installed: `npm install`
- Clear TypeScript cache: `rm -rf node_modules/.cache`
- Use `TS_NODE_TRANSPILE_ONLY=true` for deployment to skip strict type checking

**Keep-Alive Logs**
- Keep-alive pings run every 2 minutes
- Only visible in development mode (`NODE_ENV=development`)
- Production mode silences successful ping logs
- Failed pings are always logged for debugging

**Authentication Issues**
- Verify JWT_SECRET is set in environment
- Check token expiration (tokens expire after configured time)
- Ensure user role matches endpoint requirements
- Parent users can only access their own learners' data
