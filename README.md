# SUNSCHOOL

<p align="center">
  <img src="generated-icon.png" alt="SUNSCHOOL Logo" width="120" height="120">
</p>

<p align="center">
  An AI-powered educational platform for personalized learning experiences.
</p>

## Overview

SUNSCHOOL is a web-based educational platform that provides AI-generated lessons and achievement tracking for learners. The platform supports role-based access with three user types: administrators, parents, and learners.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Admin Onboarding](#admin-onboarding)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

### Implemented Features

- **AI-Generated Lessons**: Content created using OpenRouter API for personalized learning
- **Achievement System**: Gamified learning with badges and recognition
- **User Management**: Three-tier system with ADMIN, PARENT, and LEARNER roles
- **Parent-Child Relationships**: Parents can manage multiple learner accounts
- **Database Synchronization**: Parents can configure external PostgreSQL database connections for data backup
- **Progress Tracking**: Basic lesson completion and scoring
- **Cross-Platform Web App**: Works on desktop and mobile browsers

### User Roles

**Administrators:**
- Full system access
- User management capabilities
- System-wide data access

**Parents:**
- Manage their children's learner accounts
- View children's progress and achievements
- Configure database synchronization settings
- Access to personal family data only

**Learners:**
- Access assigned lessons
- View personal achievements
- Complete lessons and submit answers

## Technology Stack

### Frontend
- **React 19.1.0** with TypeScript
- **React Native Web** for cross-platform compatibility
- **React Query** for data fetching and caching
- **Wouter** for client-side routing
- **Vite** for build tooling

### Backend
- **Node.js** with **Express.js 5.1.0**
- **TypeScript** for type safety
- **JWT authentication** with role-based access control
- **PostgreSQL** (Neon serverless) with **Drizzle ORM**

### AI Integration
- **OpenRouter API** for lesson content generation
- **Perplexity API** for enhanced knowledge context

### Development Tools
- **Jest** for unit testing
- **Playwright** for end-to-end testing
- **Drizzle Kit** for database migrations

## Architecture

### Core Components

- **Web Frontend**: React application served via Express.js
- **REST API**: Express.js backend with JWT authentication
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Session Management**: Express sessions with database storage

### Data Flow

1. **Authentication**: JWT-based login with role verification
2. **Lesson Creation**: AI-generated content via OpenRouter API
3. **Progress Tracking**: Lesson completion and achievement awards
4. **Data Sync**: Optional external PostgreSQL database connections

## Installation

### Prerequisites

- Node.js (v18.x or newer)
- PostgreSQL database (local or cloud)
- npm package manager

### Clone and Setup

```bash
git clone https://github.com/realityinspector/origen-one.git
cd origen-one
npm install
```

## Database Setup

### Environment Configuration

Create a `.env` file with required variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
OPENROUTER_API_KEY=your-openrouter-key
PERPLEXITY_API_KEY=your-perplexity-key
PORT=5000
```

### Database Initialization

```bash
# Push schema to database
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

## Running the Application

### Development

```bash
npm run dev
```

Starts the server at http://localhost:5000 (or configured PORT).

### Production

```bash
npm run build
npm start
```

## Admin Setup

On first run, if no users exist, the system automatically creates an admin user. Check `admin-credentials.txt` for login details.

### Manual Admin Creation

```bash
ts-node scripts/admin-onboard.ts
```

## User Roles

### ADMIN
- Full system access and user management
- Can view all data across the platform

### PARENT
- Manage their children's learner accounts
- View children's progress and achievements
- Configure database synchronization

### LEARNER
- Access assigned lessons
- Complete lessons and view achievements

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /user` - Get current user info

### User Management
- `GET /api/parents` - List parents (ADMIN only)
- `GET /api/learners` - List learners (PARENT, ADMIN)
- `POST /api/learners` - Create learner (PARENT, ADMIN)
- `DELETE /api/learners/:id` - Delete learner (PARENT, ADMIN)
- `GET /api/learner-profile/:userId` - Get learner profile
- `PUT /api/learner-profile/:userId` - Update learner profile (PARENT, ADMIN)

### Lessons
- `POST /api/lessons/create` - Create lesson
- `GET /api/lessons/active` - Get active lesson
- `GET /api/lessons/:lessonId` - Get lesson details
- `GET /api/lessons` - List lessons
- `POST /api/lessons/:lessonId/answer` - Submit lesson answers

### Achievements
- `GET /api/achievements` - Get user achievements

### Database Sync
- `GET /api/sync-configs` - List sync configurations (PARENT)
- `POST /api/sync-configs` - Create sync configuration (PARENT)
- `GET /api/sync-configs/:id` - Get sync config (PARENT)
- `PUT /api/sync-configs/:id` - Update sync config (PARENT)
- `DELETE /api/sync-configs/:id` - Delete sync config (PARENT)
- `POST /api/sync-configs/:id/push` - Trigger sync (PARENT)

### Other
- `GET /api/reports` - Get reports
- `GET /api/export` - Export data (PARENT, ADMIN)
- `GET /api/healthcheck` - Health check

## Development

### Project Structure
- `client/` - React frontend
- `server/` - Express.js backend
- `shared/` - TypeScript schemas and types
- `scripts/` - Database and utility scripts

### Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Update database schema
- `npm run db:seed` - Seed database with test data
- `npm test` - Run unit tests
- `npx playwright test` - Run e2e tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
