# Overview

SUNSCHOOL is an AI-powered educational platform built with React Native Web and Express.js. The application provides personalized learning experiences through AI-generated lessons, achievement tracking, and a role-based user system supporting administrators, parents, and learners. The platform features cross-platform web compatibility and includes database synchronization capabilities for external data backup.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 19.1.0 with TypeScript** for type safety and modern React features
- **React Native Web** for cross-platform compatibility between web and mobile
- **Vite build system** for fast development and optimized production builds
- **React Query** for data fetching, caching, and synchronization
- **Wouter** for lightweight client-side routing
- **Component-based architecture** with organized structure in pages and components directories

## Backend Architecture
- **Node.js with Express.js 5.1.0** providing RESTful API endpoints
- **TypeScript** throughout the backend for type safety
- **JWT-based authentication** with role-based access control (ADMIN, PARENT, LEARNER)
- **Middleware pattern** for authentication, authorization, and error handling
- **Service layer architecture** separating business logic from route handlers
- **AI content generation** using OpenRouter API for personalized lesson creation

## Data Storage Solutions
- **PostgreSQL database** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations and schema management
- **Connection pooling** with retry logic for reliability
- **JSONB fields** for complex data structures like learner graphs and subject performance
- **Database synchronization system** allowing parents to backup data to external PostgreSQL instances

## Authentication and Authorization
- **JWT token-based authentication** with secure password hashing using scrypt
- **Role-based access control** with three distinct user types:
  - ADMIN: Full system access and user management
  - PARENT: Child account management and progress monitoring
  - LEARNER: Lesson access and achievement tracking
- **Parent-child relationship model** with cascade deletion for data integrity
- **Cross-domain authentication support** for sunschool.xyz domain integration

## AI and Content Generation
- **OpenRouter API integration** for lesson content generation
- **Grade-level appropriate content** with reading level optimization
- **SVG generation** for educational graphics and visualizations
- **Quiz question generation** with multiple choice and interactive formats
- **Knowledge graph creation** for tracking learning connections
- **Achievement system** with automatic badge awarding based on performance

# External Dependencies

## Third-Party Services
- **OpenRouter API** - AI content generation for lessons and educational material
- **Neon Database** - Serverless PostgreSQL hosting with connection pooling
- **Replit Auth** (configured but not actively used) - Session management capabilities

## Key NPM Packages
- **@neondatabase/serverless** - Database connection and query execution
- **drizzle-orm** - Type-safe ORM with PostgreSQL support
- **jsonwebtoken** - JWT token generation and verification
- **axios** - HTTP client for API requests
- **react-query** - Server state management and caching
- **express-session** - Session management middleware
- **passport** - Authentication middleware framework

## Development and Testing
- **TypeScript** - Static type checking across frontend and backend
- **ESLint** - Code linting with React and TypeScript rules
- **Playwright** - End-to-end testing framework
- **Jest** - Unit testing framework
- **Vite** - Frontend build tool and development server

## Database Schema
The application uses a relational schema with the following core tables:
- **users** - User accounts with role-based permissions
- **learner_profiles** - Extended learner information with JSONB performance data
- **lessons** - AI-generated educational content with status tracking
- **achievements** - Gamification system with badge rewards
- **db_sync_configs** - External database synchronization settings
- **sessions** - Session storage for authentication persistence