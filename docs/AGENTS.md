# SUNSCHOOL AI Agents & Integration

## Overview

SUNSCHOOL uses AI agents for lesson content generation, image creation, and adaptive learning. This document describes the AI integration architecture and the agents involved.

## AI Providers

### OpenRouter API
- **Purpose**: Primary AI provider for lesson content generation and image models
- **Models Used**: Configurable via environment; supports multiple LLM backends
- **Capabilities**:
  - Lesson text generation (Key Concepts, Examples, Practice sections)
  - Quiz question generation with multiple-choice answers
  - Age-appropriate content based on grade level
  - Image generation via OpenRouter image models

### Perplexity API
- **Purpose**: Enhanced knowledge context for lesson enrichment
- **Usage**: Provides factual grounding and context for AI-generated educational content

## Lesson Generation Agent

The lesson generation pipeline (`server/routes.ts`) orchestrates multiple AI capabilities:

### Flow
1. **Request**: Frontend sends `POST /api/lessons/create` with subject, category, grade level, and learnerId
2. **Permission Check**: Validates parent can create lessons for the specified child learner
3. **Content Generation**: Calls OpenRouter API to generate:
   - Lesson title and introduction
   - Key Concepts (4 bullet points)
   - Examples (3 real-world examples)
   - Practice section (interactive exercise prompt)
4. **Quiz Generation**: Creates 3 multiple-choice questions with 4 options each
5. **SVG Image Generation**: Generates subject-specific SVG illustrations using `getSubjectSVG()`
6. **Storage**: Lesson saved to database with status `ACTIVE`

### SVG Illustration System
- Subject-aware SVG generation for educational illustrations
- Inline SVGs embedded directly in lesson content
- No external image hosting required
- Supports all subjects: Math, Science, Reading, etc.

### Content Validation
- Age-appropriate vocabulary checking
- Word count limits per grade level
- Complexity scoring
- Tone validation for educational suitability

## Quiz Scoring Agent

After quiz submission (`POST /api/lessons/:lessonId/answer`):

1. **Answer Recording**: Each answer stored in `quiz_answers` table with concept tags
2. **Deduplication**: SHA-256 hashing prevents duplicate question tracking
3. **Concept Tagging**: Automatic extraction of educational concepts (addition, subtraction, plants, etc.)
4. **Score Calculation**: Percentage-based scoring with points awarded
5. **Achievement Check**: Triggers achievement system for milestones

## Adaptive Learning

### Concept Mastery Tracking
- Per-concept accuracy tracked across all quiz attempts
- Performance data available via `/api/learner/:learnerId/concept-performance`
- Struggling areas identified for targeted lesson generation

### Subject Recommendations
- Category mapping service suggests next topics based on performance
- Grade-level appropriate content selection
- Subject performance history maintained per learner

## Architecture Notes

### Parent-as-Learner Mode
Parents operate as proxy agents for their children:
- Parent authenticates with their own JWT token
- Requests include `learnerId` to specify the target child
- Server validates parent-child relationship before processing
- `/api/lessons/active?learnerId=X` returns the child's active lesson
- `/api/lessons/create` with `learnerId` in body creates for the child

### Error Handling
- AI generation failures fall back to template-based content
- SVG generation uses pre-built subject templates as defaults
- Lesson creation is idempotent (duplicate requests return existing active lesson)

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API access for LLM and image models |
| `PERPLEXITY_API_KEY` | Perplexity API for knowledge context |
| `USE_AI` | Enable/disable AI features (`1` or `0`) |

## Recent Changes

### Fixed: Parent-as-Learner Lesson Generation (Feb 2026)
- **Bug**: Duplicate `/api/lessons/create` route intercepted all requests and used `req.user.id` (parent) instead of `learnerId` from request body, causing "Learner profile not found" errors
- **Fix**: Removed legacy duplicate route; single route now properly handles `learnerId` for parent-as-learner mode
- **Bug**: `/api/lessons/active` ignored `learnerId` query parameter
- **Fix**: Route now uses `learnerId` query param when provided, falling back to `req.user.id`

### Added: E2E Test Suite (Feb 2026)
- Comprehensive Playwright test covering full child lesson flow
- Tests registration, child creation, learner mode, lesson generation, quiz completion
- Runs against production (`sunschool.xyz`) or local server
- Screenshots captured at each step for visual verification
