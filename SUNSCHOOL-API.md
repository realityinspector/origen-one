# SUNSCHOOL API: Comprehensive CRM & Educational Management Platform

## Overview

The SUNSCHOOL API transforms the existing SUNSCHOOL AI Tutor into a comprehensive CRM (Customer Relationship Management) and educational platform built on **FastAPI** with **Python**, **PostgreSQL**, and **OpenRouter** AI integration. This API provides a complete backend service for educational institutions, parents, and learners, offering robust CRUD operations, authentication, and operational management capabilities.

## Architecture

### Technology Stack
- **Backend Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 
- **ORM**: SQLAlchemy with Alembic migrations
- **Authentication**: Auth0 / Replit OAuth integration with JWT
- **AI Integration**: OpenRouter for content generation and personalized learning
- **Validation**: Pydantic models for data validation and serialization
- **Deployment**: Production-ready with automatic documentation

### Core Principles
- **API-First Design**: Complete separation of frontend and backend
- **RESTful Architecture**: Consistent, predictable API endpoints
- **Type Safety**: Full Pydantic validation on all inputs/outputs
- **Scalable**: Designed for educational institutions and large user bases
- **Secure**: Multiple authentication providers with role-based access control

## Authentication & Authorization

### Supported Authentication Methods
1. **Auth0 Integration**: Enterprise-grade authentication
2. **Replit OAuth**: Native platform integration  
3. **JWT Tokens**: Stateless authentication for API access
4. **Role-based Access Control**: ADMIN, PARENT, LEARNER roles

### Authentication Endpoints
```python
POST /api/v1/auth/login          # User login
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/refresh        # Refresh JWT tokens
POST /api/v1/auth/logout         # User logout
GET  /api/v1/auth/me             # Current user profile
```

### Authorization Middleware
- JWT token validation
- Role-based route protection
- Parent-child relationship verification
- Admin privilege escalation

## Core Data Models

### User Management
```python
class User(BaseModel):
    id: int
    email: Optional[str]
    username: str
    name: str
    role: UserRole  # ADMIN, PARENT, LEARNER
    parent_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    is_active: bool

class LearnerProfile(BaseModel):
    id: str
    user_id: int
    grade_level: int  # K=0, 1-12
    subjects: List[str]
    subject_performance: Dict[str, PerformanceMetrics]
    recommended_subjects: List[str]
    struggling_areas: List[str]
    knowledge_graph: KnowledgeGraph
    created_at: datetime
    updated_at: datetime

class PerformanceMetrics(BaseModel):
    score: float
    lesson_count: int
    last_attempted: datetime
    mastery_level: MasteryLevel  # beginner, intermediate, advanced
```

### Educational Content
```python
class Lesson(BaseModel):
    id: str
    learner_id: int
    module_id: str
    subject: str
    category: str
    difficulty: DifficultyLevel
    status: LessonStatus  # QUEUED, ACTIVE, DONE
    content_spec: LessonContentSpec
    enhanced_spec: Optional[EnhancedLessonSpec]
    score: Optional[int]
    image_paths: List[LessonImage]
    created_at: datetime
    completed_at: Optional[datetime]

class Achievement(BaseModel):
    id: str
    learner_id: int
    achievement_type: str
    title: str
    description: str
    icon: str
    awarded_at: datetime
    
class KnowledgeGraph(BaseModel):
    nodes: List[KnowledgeNode]
    edges: List[KnowledgeEdge]
    
class KnowledgeNode(BaseModel):
    id: str
    label: str
    category: Optional[str]
    importance: Optional[float]
    
class KnowledgeEdge(BaseModel):
    source: str
    target: str
    label: Optional[str]
    strength: Optional[float]
```

### CRM Features
```python
class DatabaseSyncConfig(BaseModel):
    id: str
    parent_id: int
    target_db_url: str
    last_sync_at: Optional[datetime]
    sync_status: SyncStatus  # IDLE, IN_PROGRESS, FAILED, COMPLETED
    continuous_sync: bool
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime
```

## API Endpoints

### User Management APIs

#### Admin Operations
```python
GET    /api/v1/admin/users                    # List all users
POST   /api/v1/admin/users                    # Create new user
GET    /api/v1/admin/users/{user_id}          # Get user details
PUT    /api/v1/admin/users/{user_id}          # Update user
DELETE /api/v1/admin/users/{user_id}          # Delete user
GET    /api/v1/admin/parents                  # List all parent accounts
GET    /api/v1/admin/learners                 # List all learner accounts
GET    /api/v1/admin/analytics                # Platform analytics
```

#### Parent Operations
```python
GET    /api/v1/parents/profile                # Get parent profile
PUT    /api/v1/parents/profile                # Update parent profile
GET    /api/v1/parents/learners               # List parent's learners
POST   /api/v1/parents/learners               # Create new learner
PUT    /api/v1/parents/learners/{learner_id}  # Update learner
DELETE /api/v1/parents/learners/{learner_id}  # Delete learner
GET    /api/v1/parents/dashboard              # Parent dashboard data
```

#### Learner Operations
```python
GET    /api/v1/learners/profile               # Get learner profile
PUT    /api/v1/learners/profile               # Update learner profile
GET    /api/v1/learners/progress              # Learning progress
GET    /api/v1/learners/achievements          # Learner achievements
GET    /api/v1/learners/recommendations       # Personalized recommendations
```

### Educational Content APIs

#### Lesson Management
```python
GET    /api/v1/lessons                        # List lessons (filtered)
POST   /api/v1/lessons                        # Create new lesson
GET    /api/v1/lessons/{lesson_id}            # Get lesson details
PUT    /api/v1/lessons/{lesson_id}            # Update lesson
DELETE /api/v1/lessons/{lesson_id}            # Delete lesson
GET    /api/v1/lessons/active                 # Get active lesson
POST   /api/v1/lessons/{lesson_id}/start      # Start lesson
POST   /api/v1/lessons/{lesson_id}/complete   # Complete lesson
POST   /api/v1/lessons/{lesson_id}/answer     # Submit quiz answers
```

#### Subject & Curriculum Management
```python
GET    /api/v1/subjects                       # List available subjects
POST   /api/v1/subjects                       # Create custom subject
PUT    /api/v1/subjects/{subject_id}          # Update subject
DELETE /api/v1/subjects/{subject_id}          # Delete subject
GET    /api/v1/subjects/{subject_id}/lessons  # Get subject lessons
GET    /api/v1/curriculum                     # Get curriculum structure
PUT    /api/v1/curriculum                     # Update curriculum
```

#### Knowledge Graph APIs
```python
GET    /api/v1/knowledge-graph/{learner_id}   # Get learner's knowledge graph
PUT    /api/v1/knowledge-graph/{learner_id}   # Update knowledge graph
POST   /api/v1/knowledge-graph/nodes          # Add knowledge node
PUT    /api/v1/knowledge-graph/nodes/{node_id} # Update knowledge node
DELETE /api/v1/knowledge-graph/nodes/{node_id} # Delete knowledge node
POST   /api/v1/knowledge-graph/edges          # Add knowledge connection
DELETE /api/v1/knowledge-graph/edges/{edge_id} # Delete knowledge connection
```

### Achievement System APIs
```python
GET    /api/v1/achievements                   # List achievements (filtered)
POST   /api/v1/achievements                   # Create achievement
GET    /api/v1/achievements/{achievement_id}  # Get achievement details
PUT    /api/v1/achievements/{achievement_id}  # Update achievement
DELETE /api/v1/achievements/{achievement_id}  # Delete achievement
POST   /api/v1/achievements/award             # Award achievement to learner
GET    /api/v1/achievements/types             # List achievement types
```

### Analytics & Reporting APIs
```python
GET    /api/v1/analytics/learner/{learner_id} # Individual learner analytics
GET    /api/v1/analytics/parent/{parent_id}   # Parent's children analytics
GET    /api/v1/analytics/admin/overview       # Platform overview analytics
GET    /api/v1/reports/progress               # Progress reports
GET    /api/v1/reports/performance            # Performance reports
POST   /api/v1/reports/custom                 # Generate custom reports
```

### Database Synchronization APIs (CRM Feature)
```python
GET    /api/v1/sync/configs                   # List sync configurations
POST   /api/v1/sync/configs                   # Create sync configuration
GET    /api/v1/sync/configs/{config_id}       # Get sync config details
PUT    /api/v1/sync/configs/{config_id}       # Update sync configuration
DELETE /api/v1/sync/configs/{config_id}       # Delete sync configuration
POST   /api/v1/sync/configs/{config_id}/test  # Test database connection
POST   /api/v1/sync/configs/{config_id}/sync  # Trigger manual sync
GET    /api/v1/sync/status                    # Get sync status
```

## AI Integration with OpenRouter

### Content Generation
```python
POST   /api/v1/ai/generate/lesson             # Generate lesson content
POST   /api/v1/ai/generate/questions          # Generate quiz questions
POST   /api/v1/ai/generate/explanations       # Generate explanations
POST   /api/v1/ai/analyze/performance         # Analyze learner performance
POST   /api/v1/ai/recommend/content           # Get content recommendations
POST   /api/v1/ai/adapt/difficulty            # Adapt content difficulty
```

### AI-Powered Features
- **Personalized Content Generation**: Lessons adapted to grade level and learning style
- **Adaptive Questioning**: Questions that adjust based on performance
- **Performance Analysis**: AI-driven insights into learning patterns
- **Content Recommendations**: Suggested topics and difficulty levels
- **Knowledge Gap Detection**: Identification of learning gaps
- **Progress Prediction**: Predictive analytics for learning outcomes

## Security & Best Practices

### Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- Rate limiting on API endpoints
- CORS configuration for frontend integration
- Secure database connection handling

### Data Privacy
- GDPR-compliant data handling
- Parent consent management
- Data retention policies
- Secure data synchronization
- Audit logging for all operations

### Performance Optimizations
- Database query optimization
- Connection pooling
- Response caching where appropriate
- Pagination for large datasets
- Background task processing
- Efficient database indexing

## Database Schema

### Core Tables
```sql
-- Users table (supports all roles)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE,
    username VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    role user_role DEFAULT 'LEARNER',
    password VARCHAR, -- For non-OAuth users
    parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced learner profiles
CREATE TABLE learner_profiles (
    id VARCHAR PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    grade_level INTEGER NOT NULL,
    subjects JSONB DEFAULT '["Math", "Science"]',
    subject_performance JSONB DEFAULT '{}',
    recommended_subjects JSONB DEFAULT '[]',
    struggling_areas JSONB DEFAULT '[]',
    knowledge_graph JSONB DEFAULT '{"nodes": [], "edges": []}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comprehensive lesson tracking
CREATE TABLE lessons (
    id VARCHAR PRIMARY KEY,
    learner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR NOT NULL,
    subject VARCHAR,
    category VARCHAR,
    difficulty difficulty_level DEFAULT 'beginner',
    status lesson_status DEFAULT 'QUEUED',
    content_spec JSONB,
    enhanced_spec JSONB,
    score INTEGER,
    image_paths JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Achievement system
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR NOT NULL,
    payload JSONB,
    awarded_at TIMESTAMP DEFAULT NOW()
);

-- Database synchronization (CRM feature)
CREATE TABLE db_sync_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_db_url VARCHAR NOT NULL,
    last_sync_at TIMESTAMP,
    sync_status sync_status DEFAULT 'IDLE',
    continuous_sync BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Installation & Deployment

### Prerequisites
```bash
# System Requirements
- Python 3.11+
- PostgreSQL 13+
- Redis (for caching and background tasks)
- Docker (optional, for containerized deployment)
```

### Installation Steps
```bash
# Clone repository
git clone <repository-url>
cd sunschool-api

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Database setup
alembic upgrade head

# Run development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Environment Configuration
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sunschool_db

# Authentication
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OpenRouter AI
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "https://your-frontend.com"]
```

## API Documentation

### Automatic Documentation
- **Swagger UI**: Available at `/docs`
- **ReDoc**: Available at `/redoc`
- **OpenAPI Schema**: Available at `/openapi.json`

### Response Formats
```python
# Success Response
{
    "success": true,
    "data": {...},
    "message": "Operation completed successfully"
}

# Error Response
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input provided",
        "details": {...}
    }
}

# Paginated Response
{
    "success": true,
    "data": [...],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 150,
        "pages": 8
    }
}
```

## Integration Guidelines

### Frontend Integration
- Use provided TypeScript types for type safety
- Implement proper error handling for all API calls
- Support pagination for list endpoints
- Handle authentication state management
- Implement real-time updates where appropriate

### Third-Party Integrations
- **Learning Management Systems (LMS)**: Canvas, Blackboard integration
- **Student Information Systems (SIS)**: PowerSchool, Skyward integration
- **Assessment Tools**: Integration with external testing platforms
- **Communication Platforms**: Slack, Microsoft Teams notifications

## Monitoring & Observability

### Logging
- Structured logging with correlation IDs
- User action audit trails
- Performance monitoring
- Error tracking and alerting

### Health Checks
```python
GET /api/v1/health              # Basic health check
GET /api/v1/health/detailed     # Detailed system status
GET /api/v1/health/db           # Database connectivity
GET /api/v1/health/ai           # AI service connectivity
```

## Future Enhancements

### Planned Features
1. **Advanced Analytics Dashboard**: Real-time learning analytics
2. **Multi-Tenant Support**: Institution-level data segregation
3. **Advanced AI Features**: Predictive modeling and recommendations
4. **Mobile App Support**: Native mobile API optimizations
5. **Offline Learning**: Sync capabilities for offline usage
6. **Assessment Builder**: Custom assessment creation tools
7. **Parent Communication Portal**: Enhanced parent-teacher communication
8. **Gamification Engine**: Advanced achievement and reward systems

### Scalability Considerations
- Microservices architecture migration path
- Database sharding strategies
- CDN integration for content delivery
- Auto-scaling deployment configurations
- Performance optimization recommendations

---

## Support & Documentation

For detailed API documentation, visit the automatic documentation endpoints:
- **Interactive API Docs**: `/docs`
- **Alternative Docs**: `/redoc`
- **API Schema**: `/openapi.json`

For support and questions, contact the development team or refer to the comprehensive documentation included with the API deployment.