# ORIGEN: The Open Source AI Tutor

<p align="center">
  <img src="generated-icon.png" alt="Origen AI Tutor Logo" width="120" height="120">
</p>

<p align="center">
  An AI-powered educational mobile app designed to provide personalized, engaging learning experiences for children through adaptive, interactive technologies.
</p>

<p align="center">
  <a href="https://github.com/realityinspector/origen-one">GitHub Repository</a>
</p>

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Admin Onboarding](#admin-onboarding)
- [Workflows](#workflows)
- [User Roles and Permissions](#user-roles-and-permissions)
- [API Endpoints](#api-endpoints)
- [AI Integration](#ai-integration)
- [Cross-Environment Compatibility and Error Handling](#cross-environment-compatibility-and-error-handling)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Origen AI Tutor is an innovative educational platform that combines artificial intelligence with pedagogical principles to deliver personalized learning experiences. The platform adapts to each learner's needs, providing customized lessons, interactive knowledge graphs, and engaging quizzes to enhance the learning experience.

Designed for children and educational institutions, Origen helps bridge learning gaps and fosters a love for education through its intuitive interface and AI-driven content generation.

## Features

### Core Features

- **Personalized Learning**: AI-generated content tailored to each learner's grade level and learning pace
- **Interactive Knowledge Graphs**: Visual concept maps that connect related topics and ideas
- **Adaptive Quizzes**: Questions that adjust in difficulty based on learner performance
- **Achievement System**: Gamified learning with badges and recognition for milestones
- **Progress Tracking**: Detailed analytics on learning progress and areas for improvement
- **Database Synchronization**: Parents can synchronize their data to external PostgreSQL databases for backup and multi-device access

### User Experience

- **Dual-Mode Interface**: Toggle between learner mode (for students) and grown-up mode (for parents/teachers)
- **Responsive Design**: Works on desktops, tablets, and mobile devices
- **Accessibility-Focused**: Designed to be inclusive and usable by learners of all abilities

### Administrative Tools

- **Parent Dashboard**: Monitor child's progress and achievements
- **Admin Controls**: Manage users, content, and system settings
- **Reporting Suite**: Generate comprehensive learning reports

## Technology Stack

### Frontend
- **React Native** for cross-platform mobile development
- **React Query** for efficient data fetching and caching
- **TypeScript** for type-safe development
- **React Native Web** for web compatibility
- **Wouter** for routing

### Backend
- **Node.js** with Express for API services
- **JWT Authentication** for secure user sessions
- **PostgreSQL** for data storage
- **Drizzle ORM** for database operations

### AI and Machine Learning
- **OpenRouter/LLM Integration** for content generation
- **Perplexity API** for knowledge augmentation

### DevOps
- **TypeScript** for both frontend and backend development
- **Jest** for testing
- **Playwright** for end-to-end testing

## Architecture

Origen follows a modern, scalable architecture:

- **Client-Server Model**: Decoupled frontend and backend services
- **RESTful API**: Clear, predictable API endpoints
- **State Management**: React Query for server state, React Context for UI state
- **Database Schema**: Normalized PostgreSQL schema for efficient data storage
- **Service-Oriented Design**: Modular services for authentication, lessons, achievements, etc.
- **Error Handling**: Comprehensive error handling throughout the application
- **Environment Agnostic**: Works seamlessly in both development and production environments

## Installation

### Prerequisites

- Node.js (v16.x or newer)
- PostgreSQL (v13 or newer)
- npm or yarn package manager

### Clone the Repository

```bash
git clone https://github.com/realityinspector/origen-one.git
cd origen-one
```

### Install Dependencies

```bash
npm install
```

## Database Setup

### Configuration

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/origen_db
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Schema Migration

Initialize the database schema using Drizzle:

```bash
npm run db:push
```

Or if you need to generate migrations:

```bash
npm run db:generate
npm run db:migrate
```

### Seeding Demo Data

To populate the database with sample data for testing:

```bash
npm run db:seed
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start both the backend server and the React application in development mode. The application will be available at http://localhost:5000.

### Production Build

```bash
npm run build
npm start
```

## Admin Onboarding

This application has an automatic admin onboarding workflow that will create the first admin user if no users exist in the system. This is a one-time process that happens automatically when the application is first installed.

### How Admin Onboarding Works

1. The workflow checks if any users exist in the system.
2. If no users exist, it creates a default admin user with the following credentials:
   - Username: `admin`
   - Email: `admin@origen.edu`
   - A secure randomly generated password

3. The credentials are saved to a file named `admin-credentials.txt` in the project root directory.
4. **IMPORTANT:** After logging in for the first time, immediately change the password to something secure that you can remember.

### Running the Admin Onboarding Workflow Manually

The workflow runs automatically when the application is first installed. However, if you need to run it manually, you can use the following command:

```bash
ts-node -r dotenv/config scripts/admin-onboard.ts
```

Or you can use the configured workflow:

```bash
npm run admin:onboard
```

### First-time Setup Instructions

1. After the application is installed, the admin onboarding workflow will run automatically.
2. Look for the `admin-credentials.txt` file in the project root directory.
3. Log in using the provided admin credentials at `/auth`.
4. Navigate to your profile settings and change the default password immediately.
5. You can now start using the admin features to manage the application.

### Security Notice

The admin onboarding workflow is designed to be self-disposing, meaning it will only create an admin user if none exists. Once an admin user has been created, the workflow will exit without making any changes, even if run manually.

For production environments, it's recommended to delete the `admin-credentials.txt` file after you've successfully logged in and changed the password.

## Workflows

Origen comes with several pre-configured workflows for common development tasks:

### Database Workflows

- **DB Push**: `npm run db:push` - Push schema changes directly to the database
- **DB Generate Migrations**: `npm run db:generate` - Generate migration files for schema changes
- **DB Migrate**: `npm run db:migrate` - Apply pending migrations
- **DB Seed**: `npm run db:seed` - Seed the database with demo data

### Server Workflow

- **Development Server**: `npm run dev` - Start the server in development mode

## User Roles and Permissions

Origen AI Tutor has three main user roles:

### ADMIN
- Full access to all features and functionalities
- Can manage users, content, and system settings
- Can view all learner data and reports

### PARENT
- Can manage their linked learner accounts
- Can view progress reports for their learners
- Can create and manage learner profiles

### LEARNER
- Can access lessons and quizzes
- Can view their own progress and achievements
- Limited access to system settings

## API Endpoints

Below are the key API endpoints available in the application:

### Authentication
- `POST /api/login` - User login (also available at `/login`)
- `POST /api/register` - User registration (also available at `/register`) 
- `GET /api/user` - Get current user details (also available at `/user`)

### User Management
- `GET /api/parents` - List all parents (ADMIN only)
- `GET /api/learners` - List learners (PARENT, ADMIN)
- `GET /api/learner-profile/:userId` - Get learner profile

### Lessons
- `GET /api/lessons/active` - Get active lesson
- `POST /api/lessons/create` - Create a new lesson
- `GET /api/lessons/:lessonId` - Get specific lesson
- `GET /api/lessons` - List all lessons
- `POST /api/lessons/:lessonId/answer` - Submit answers to a quiz

### Achievements
- `GET /api/achievements` - List user achievements

### Data Export
- `GET /api/export` - Export user data (PARENT, ADMIN)

### Database Synchronization
- `GET /api/sync-configs` - List database sync configurations (PARENT)
- `GET /api/sync-configs/:id` - Get specific sync configuration (PARENT)
- `POST /api/sync-configs` - Create new sync configuration (PARENT)
- `PUT /api/sync-configs/:id` - Update sync configuration (PARENT)
- `DELETE /api/sync-configs/:id` - Delete sync configuration (PARENT)
- `POST /api/sync-configs/:id/push` - Push data to external database (PARENT)

## AI Integration

Origen leverages AI technologies to deliver personalized education:

### Content Generation

The platform uses OpenRouter and Perplexity APIs to generate:
- Lesson content tailored to grade level and topic
- Adaptive quiz questions with varying difficulty
- Personalized feedback based on learner performance
- Knowledge graphs that visualize topic relationships

### Configuration

AI features can be enabled or disabled through environment variables:
- `USE_AI=1` - Enable AI-generated content
- `USE_AI=0` - Use static content instead (useful for testing)

### API Keys

To use the AI features, you'll need to set the following environment variables:
- `OPENROUTER_API_KEY` - For lesson generation
- `PERPLEXITY_API_KEY` - For enhanced knowledge context

## Cross-Environment Compatibility and Error Handling

Origen is designed to work seamlessly across different environments including development, testing, and production deployments.

### Multi-Environment Authentication

- **Flexible Endpoints**: All authentication endpoints are available with and without the `/api` prefix
- **Robust Token Handling**: JWT tokens are safely managed and validated 
- **Content-Type Verification**: All API responses are validated for proper format and content type

### Error Handling Strategy

- **Comprehensive Validation**: Input and output validation at all levels of the application
- **Graceful Degradation**: The application continues to function even when parts of it encounter errors
- **Detailed Logging**: Enhanced logging for troubleshooting authentication and data issues
- **Safe Type Handling**: Extensive null checking and type validation to prevent runtime errors

### Development Tips

- Always check both traditional (`/api/login`) and direct (`/login`) endpoint patterns when troubleshooting
- Use the browser's developer tools to inspect network requests and responses
- Enable detailed logging in development by setting `NODE_ENV=development`
- Check for proper Content-Type headers in API responses (should be `application/json`)

## Development

### Code Organization

- `client/` - React Native web client
- `server/` - Express.js backend
- `shared/` - Shared types and utilities
- `scripts/` - Database and utility scripts
- `tests/` - Test suites

### Development Workflow

1. Make changes to the codebase
2. Run tests: `npm test`
3. Start development server: `npm run dev`
4. When database schema changes:
   - Update models in `shared/schema.ts`
   - Run `npm run db:push` to update the database

### Testing

- Unit tests: `npm run test:unit`
- End-to-end tests: `npm run test:e2e`

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows our coding standards and includes appropriate tests.

## License

Origen AI Tutor is open-source software licensed under the MIT license. See the LICENSE file for more details.
