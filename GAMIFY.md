[6 tools called]

Based on my analysis of the SUNSCHOOL codebase, I'll design a comprehensive gamification system that builds upon the existing achievement infrastructure while introducing points/tokens and a parent-managed rewards system.

# GAMIFICATION-SYSTEM.md

## Overview

The SUNSCHOOL gamification system extends the existing achievement framework to include a points-based token economy and parent-managed rewards shop. This system motivates learners through immediate feedback on quiz performance while providing parents with tools to create meaningful real-world incentives.

## System Architecture

### Core Components

1. **Token System** - Points earned through quiz performance and lesson completion
2. **Rewards Shop** - Parent-configured catalog of real-world rewards
3. **Redemption System** - Learner interface for redeeming earned tokens
4. **Progress Tracking** - Goals and milestone tracking across subjects
5. **Enhanced Achievements** - Dynamic achievement system with configurable rewards

### Integration Points

- **Extends Existing Achievement System**: Builds upon `achievements` table and `checkForAchievements()` function
- **Leverages Lesson Scoring**: Uses existing lesson `score` field and completion tracking
- **Role-Based Access**: Parents manage rewards, learners earn and redeem tokens
- **Database Sync Compatible**: New tables include in existing sync configurations

## Database Schema Extensions

### New Tables

#### Points Ledger
```sql
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earned, negative for redeemed
  source_type TEXT NOT NULL, -- 'QUIZ_CORRECT', 'LESSON_COMPLETE', 'ACHIEVEMENT', 'REDEMPTION'
  source_id TEXT, -- Reference to lesson_id, achievement_id, or reward_redemption_id
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_learner_points (learner_id, created_at),
  INDEX idx_source (source_type, source_id)
);
```

#### Learner Points Balance
```sql
CREATE TABLE learner_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Rewards Catalog
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  token_cost INTEGER NOT NULL CHECK (token_cost > 0),
  category TEXT DEFAULT 'GENERAL', -- 'GENERAL', 'OUTDOOR', 'FOOD', 'ENTERTAINMENT', 'EDUCATIONAL'
  is_active BOOLEAN DEFAULT TRUE,
  max_redemptions INTEGER, -- NULL for unlimited
  current_redemptions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_parent_rewards (parent_id, is_active),
  INDEX idx_category (category, is_active)
);
```

#### Reward Redemptions
```sql
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  tokens_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'
  requested_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  parent_notes TEXT,
  learner_notes TEXT,
  INDEX idx_learner_redemptions (learner_id, status),
  INDEX idx_reward_redemptions (reward_id, status)
);
```

#### Learning Goals
```sql
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  target_type TEXT NOT NULL, -- 'LESSONS_COMPLETED', 'QUIZ_SCORE_AVERAGE', 'SUBJECT_MASTERY', 'TIME_SPENT'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  deadline DATE,
  token_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_learner_goals (learner_id, is_completed),
  INDEX idx_parent_goals (parent_id, is_completed)
);
```

### Schema Updates

#### Enhanced Achievements Table
```sql
-- Add token reward to existing achievements
ALTER TABLE achievements 
ADD COLUMN token_reward INTEGER DEFAULT 0,
ADD COLUMN is_repeatable BOOLEAN DEFAULT FALSE;
```

## Points System Design

### Earning Mechanisms

#### Quiz Performance Points
- **Correct Answer**: 10 points base
- **Difficulty Multiplier**: Easy (1x), Medium (1.5x), Hard (2x)
- **Streak Bonus**: Consecutive correct answers (up to 5x multiplier)
- **Speed Bonus**: Answering within time threshold (+20% bonus)

#### Lesson Completion Points
- **Completion Base**: 50 points
- **Score Multiplier**: (score/100) * completion points
- **Subject Mastery Bonus**: Additional points for maintaining high scores in a subject

#### Achievement Bonuses
- **Standard Achievement**: 100 points
- **Milestone Achievement**: 250 points
- **Rare Achievement**: 500 points

#### Goal Achievement Points
- **Configurable by Parent**: 50-1000 points per goal
- **Progress Milestones**: Partial rewards for goal progress (25%, 50%, 75%)

### Token Economy Rules

1. **No Negative Balance**: Learners cannot spend more tokens than they have
2. **Point Persistence**: Tokens remain valid indefinitely (no expiration)
3. **Transparent Tracking**: All point transactions logged in ledger
4. **Parent Oversight**: Parents can view all transactions and adjust balances if needed

## API Design

### Points Management Endpoints

#### Learner Endpoints
```
GET /api/points/balance - Get current token balance and history
GET /api/points/history - Paginated transaction history
GET /api/rewards/available - List available rewards for redemption
POST /api/rewards/redeem/:rewardId - Request reward redemption
GET /api/goals/active - Get active learning goals
```

#### Parent Endpoints
```
GET /api/points/ledger/:learnerId - View learner's point history
POST /api/points/adjust - Admin adjustment of learner balance
GET /api/rewards - List all rewards for family's learners
POST /api/rewards - Create new reward
PUT /api/rewards/:id - Update reward
DELETE /api/rewards/:id - Delete reward
GET /api/rewards/redemptions - View pending redemptions
POST /api/rewards/redemptions/:id/approve - Approve redemption
POST /api/rewards/redemptions/:id/complete - Mark as completed
GET /api/goals - List learning goals
POST /api/goals - Create learning goal
PUT /api/goals/:id - Update goal progress
```

### Enhanced Achievement Endpoints
```
GET /api/achievements/enhanced - Get achievements with token rewards
POST /api/achievements/custom - Create custom achievement (ADMIN/PARENT)
```

## Frontend Architecture

### New Components

#### Token Display Components
- `TokenBalance.tsx` - Current balance display with animation
- `PointsHistory.tsx` - Transaction history with filtering
- `TokenEarnedAnimation.tsx` - Celebration animation for point gains

#### Rewards Shop Components
- `RewardsCatalog.tsx` - Grid of available rewards
- `RewardCard.tsx` - Individual reward display with cost and description
- `RedemptionModal.tsx` - Redemption request interface
- `RedemptionHistory.tsx` - Past and pending redemptions

#### Goal Tracking Components
- `LearningGoals.tsx` - Active goals dashboard
- `GoalProgress.tsx` - Progress visualization
- `GoalCreationModal.tsx` - Parent goal creation interface

#### Enhanced Achievement Components
- `AchievementNotification.tsx` - Toast notifications with token rewards
- `AchievementGallery.tsx` - Achievement showcase with earned tokens

### Page Structure

#### Learner Dashboard Updates
- Add token balance widget
- Integrate rewards shop access
- Show active goals progress
- Enhanced achievement notifications

#### Parent Dashboard Extensions
- Rewards management section
- Goal creation and monitoring
- Token balance oversight
- Redemption approval queue

## Implementation Plan

### Phase 1: Core Token System (Week 1-2)

#### Backend Implementation
1. **Database Migration**: Create new tables and update achievements table
2. **Points Service**: Core logic for earning, tracking, and spending tokens
3. **Quiz Integration**: Modify lesson answering to award points
4. **Basic API Endpoints**: Balance checking and transaction history

#### Frontend Implementation
1. **Token Display**: Balance component integration
2. **Points Animation**: Real-time feedback for quiz answers
3. **Basic Rewards Shop**: Simple catalog display

#### Testing Setup
1. **Points Service Tests**: Unit tests for point calculations
2. **Database Integration Tests**: Migration and basic CRUD operations
3. **API Endpoint Tests**: Authentication and authorization

### Phase 2: Rewards Management (Week 3-4)

#### Backend Implementation
1. **Rewards CRUD**: Full rewards management API
2. **Redemption System**: Request and approval workflow
3. **Parent Controls**: Reward creation, editing, deactivation

#### Frontend Implementation
1. **Rewards Management UI**: Parent interface for reward creation
2. **Redemption Interface**: Learner redemption workflow
3. **Approval System**: Parent approval interface

#### Testing Setup
1. **Rewards API Tests**: CRUD operations and validation
2. **Redemption Workflow Tests**: End-to-end redemption process
3. **Role-based Access Tests**: Parent/learner permission boundaries

### Phase 3: Goals and Enhanced Achievements (Week 5-6)

#### Backend Implementation
1. **Goal System**: CRUD operations for learning goals
2. **Progress Tracking**: Automatic goal progress updates
3. **Enhanced Achievements**: Dynamic achievement system

#### Frontend Implementation
1. **Goal Management**: Parent goal creation interface
2. **Progress Visualization**: Goal progress charts and indicators
3. **Achievement Enhancements**: Dynamic achievement notifications

#### Testing Setup
1. **Goal System Tests**: Goal creation, progress tracking, completion
2. **Achievement Tests**: Dynamic achievement awarding
3. **Integration Tests**: Full user journey testing

### Phase 4: Polish and Optimization (Week 7-8)

#### Performance Optimization
1. **Caching Strategy**: Redis caching for frequent queries
2. **Database Indexing**: Optimize query performance
3. **API Rate Limiting**: Prevent abuse of point-related endpoints

#### UI/UX Polish
1. **Animation Enhancements**: Smooth token earning animations
2. **Notification System**: Comprehensive notification preferences
3. **Mobile Optimization**: Ensure mobile-first responsive design

#### Testing Setup
1. **Performance Tests**: Load testing for concurrent users
2. **E2E Tests**: Complete user journey automation
3. **Accessibility Tests**: WCAG compliance verification

## Testing Strategy

### Unit Testing
```typescript
// server/services/__tests__/points.test.ts
describe('Points Service', () => {
  test('calculates quiz points correctly', () => {
    expect(calculateQuizPoints('HARD', true, 3)).toBe(60); // 10 * 2 * 3
  });
  
  test('prevents negative balance', () => {
    expect(() => spendTokens(100, 50)).toThrow('Insufficient balance');
  });
});
```

### Integration Testing
```typescript
// server/routes/__tests__/gamification.test.ts
describe('Gamification API', () => {
  test('awards points for correct quiz answer', async () => {
    const response = await request(app)
      .post('/api/lessons/123/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0, 1, 2] });
    
    expect(response.body.pointsAwarded).toBe(45);
    expect(response.body.newBalance).toBe(145);
  });
});
```

### E2E Testing
```typescript
// tests/e2e/gamification.spec.ts
test('complete reward redemption flow', async ({ page }) => {
  // Learner earns points
  await page.goto('/lesson/123');
  await page.click('text=Answer Question');
  await page.click('text=Submit Answers');
  
  // Check points awarded
  await expect(page.locator('.token-balance')).toContainText('145');
  
  // Navigate to rewards shop
  await page.click('text=Rewards Shop');
  
  // Redeem reward
  await page.click('text=Redeem Ice Cream');
  await page.click('text=Confirm Redemption');
  
  // Check pending status
  await expect(page.locator('.redemption-status')).toContainText('Pending Approval');
});
```

## Migration Strategy

### Database Migration
1. **Zero-downtime Migration**: Use Drizzle's migration system
2. **Backwards Compatibility**: Existing achievements remain functional
3. **Data Seeding**: Initialize all learners with zero balance
4. **Audit Trail**: Comprehensive logging of all point transactions

### Feature Flag Implementation
```typescript
// server/config/flags.ts
export const GAMIFICATION_ENABLED = process.env.GAMIFICATION_ENABLED === '1';

// server/routes.ts
if (GAMIFICATION_ENABLED) {
  registerGamificationRoutes(app);
}
```

### Gradual Rollout
1. **Beta Testing**: Enable for select parent accounts
2. **Feature Flags**: Granular control over feature activation
3. **Monitoring**: Track usage metrics and performance impact
4. **Rollback Plan**: Ability to disable features without data loss

## Success Metrics

### Engagement Metrics
- **Token Velocity**: Points earned per active learner per week
- **Redemption Rate**: Percentage of earned tokens redeemed
- **Goal Completion**: Percentage of learning goals achieved
- **Session Length**: Average time spent in learning activities

### Educational Impact
- **Quiz Performance**: Improvement in quiz scores over time
- **Lesson Completion**: Increase in lessons completed
- **Subject Mastery**: Progress in subject-specific competencies
- **Retention Rate**: Learner engagement over extended periods

## Security Considerations

### Authorization
- **Parent-Child Isolation**: Learners can only see family rewards
- **Balance Protection**: Server-side validation prevents overspending
- **Audit Trail**: All point transactions logged with timestamps

### Data Privacy
- **Family Data Isolation**: Rewards and goals scoped to family units
- **PII Protection**: No sensitive data in reward descriptions
- **Export Compliance**: Include gamification data in existing export features

## Monitoring and Maintenance

### Key Metrics to Monitor
- Point transaction volume and success rates
- Reward redemption approval times
- Database performance for new gamification queries
- User engagement with gamification features

### Maintenance Tasks
- Regular cleanup of old redemption records
- Balance reconciliation checks
- Performance optimization of point calculation algorithms
- User feedback collection and feature iteration

This gamification system design provides a solid foundation for motivating learners while giving parents meaningful tools to encourage educational progress. The phased implementation approach ensures each component can be thoroughly tested and refined before moving to the next phase.