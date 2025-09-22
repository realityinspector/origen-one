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
  graph JSON, -- Basic graph structure (not fully implemented)
  subjects JSON DEFAULT '["Math", "Science"]',
  subject_performance JSON DEFAULT '{}',
  recommended_subjects JSON DEFAULT '[]', -- Not implemented
  struggling_areas JSON DEFAULT '[]', -- Not implemented
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
  enhanced_spec JSON, -- Extended lesson format (not implemented)
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
- `POST /api/lessons/create` - Create new lesson
- `GET /api/lessons/active` - Get active lesson
- `GET /api/lessons/:lessonId` - Get specific lesson
- `GET /api/lessons` - List lessons
- `POST /api/lessons/:lessonId/answer` - Submit lesson answers

### Achievements
- `GET /api/achievements` - Get user achievements

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
1. User requests lesson creation via API
2. Backend generates lesson content using OpenRouter AI
3. Lesson stored in database with status 'QUEUED'
4. Frontend can retrieve and display lesson
5. User completes lesson and submits answers
6. Backend calculates score and updates lesson status

### Database Sync Process
1. Parent configures external PostgreSQL connection
2. System validates connection and stores configuration
3. Parent initiates manual sync or enables continuous sync
4. Backend performs one-way data replication to external database
5. Sync status tracked and reported to user

## Development Scripts

### Database Management
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Apply migrations
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

## Known Limitations

### Not Yet Implemented
- Interactive knowledge graphs (schema exists but UI not complete)
- Enhanced lesson format with images and diagrams
- Subject recommendations based on performance
- Advanced quiz system with multiple question types
- Continuous database synchronization
- Real-time collaborative features

### Current Constraints
- Basic lesson content generation (text-only)
- Simple achievement system
- Manual database sync process
- Limited multimedia support

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
The application can be containerized but requires PostgreSQL database setup.

### Environment Setup
1. Configure PostgreSQL database
2. Set environment variables
3. Run database migrations
4. Create initial admin user
5. Start application server

## Testing

### Available Tests
- Unit tests with Jest
- End-to-end tests with Playwright
- Database sync testing script

### Test Scripts
- `npm test` - Run unit tests
- `npx playwright test` - Run e2e tests
- `./test-db-sync.sh` - Test database synchronization

## Monitoring & Debugging

### Logging
- Console logging throughout application
- Database query logging in development
- Error tracking with stack traces

### Health Checks
- `/api/healthcheck` endpoint for basic monitoring
- Database connectivity verification
- Memory and performance monitoring

### Troubleshooting
- TypeScript compilation issues can be bypassed with `TS_NODE_TRANSPILE_ONLY=true`
- Database connection issues logged with detailed error messages
- Authentication failures tracked with user context
