# Overview

SUNSCHOOL is an AI-powered educational platform that provides personalized learning experiences for children. The application consists of a React-based frontend and an Express.js backend, with comprehensive user management supporting admins, parents, and learners. The system generates AI-driven educational content, tracks learning progress through interactive knowledge graphs, and includes features like adaptive quizzes, achievement systems, and database synchronization capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 19.1.0 with TypeScript support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Build Tool**: Vite for fast development and optimized production builds
- **Cross-Platform Support**: React Native Web for potential mobile deployment
- **UI Components**: Custom components with React Feather icons and SVG support

## Backend Architecture
- **Framework**: Express.js 5.1.0 with TypeScript
- **Authentication**: JWT-based authentication with role-based access control (ADMIN, PARENT, LEARNER)
- **Database ORM**: Drizzle ORM with PostgreSQL support
- **Password Security**: scrypt-based password hashing with salt
- **Error Handling**: Centralized async error handling with custom middleware
- **CORS Support**: Cross-origin resource sharing for sunschool.xyz domain integration

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless support
- **Schema Management**: Drizzle migrations with versioned SQL files
- **User Hierarchy**: Three-tier system (Admin → Parent → Learner)
- **JSON Storage**: JSONB fields for complex data like knowledge graphs, achievements, and subject performance tracking
- **Database Sync**: One-way replication system for parent-to-learner database synchronization

## Authentication and Authorization
- **Token System**: JWT tokens with configurable expiration
- **Role-based Access**: Middleware for role checking (hasRole, authenticateJwt)
- **Password Management**: Secure hashing with timing-safe comparisons
- **Cross-domain Support**: Special handling for sunschool.xyz domain requests
- **Session Security**: Stateless JWT approach for scalability

## Content Generation System
- **AI Integration**: OpenRouter API with Llama models for educational content generation
- **Image Generation**: SVG-based educational diagrams and illustrations
- **Lesson Structure**: Rich content format with sections, metadata, and embedded media
- **Subject Recommendations**: AI-driven subject suggestion based on performance
- **Knowledge Graphs**: Interactive visual representation of learning concepts and connections

## External Dependencies

- **AI Services**: OpenRouter API for content generation using Llama models
- **Database**: Neon PostgreSQL serverless database
- **Development Tools**: TypeScript, ESLint, Playwright for testing
- **Build and Deployment**: Node.js runtime with npm package management
- **WebSocket Support**: ws library for Neon database connections
- **Domain Integration**: Special configuration for sunschool.xyz domain deployment