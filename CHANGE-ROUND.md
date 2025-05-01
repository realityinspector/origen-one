# Refactor and Hardening Progress

## Completed Tasks

1. ✅ **Swap session cookies for JWT** – Implemented JWT authentication in server/auth.ts and server/middleware/auth.ts.

2. ✅ **Lock provider to OpenRouter with Llama models** – Created server/services/ai.ts with a unified interface that uses OpenRouter with Llama models.
   - Removed perplexity.ts and its imports/usages
   - Simplified the AI interface to use only OpenRouter

3. ✅ **Move Drizzle schema into migrations** – Generated SQL with drizzle-kit, committed versioned migrations, and set up migration workflows.

4. ✅ **Feature flags** – Implemented feature flags in server/config/flags.ts with USE_AI and ENABLE_STATS.

5. ✅ **Seed script** – Created scripts/seed.ts and scripts/seed-clean.ts to seed demo admin, parent, learner, and sample lessons.

6. ✅ **Replit Setup** – Set up Replit with node and PostgreSQL; created .env.example with required environment variables.

## Remaining Tasks

1. **Shrink dependency surface** – Remove unused dependencies (e.g., react-native-reanimated, hammerjs, ws client on server). Keep only React Native core, TanStack Query, Drizzle ORM, and axios.

2. **Cut navigation bloat** – Simplify learner flow to *Home → Lesson → Quiz → Feedback*. Replace multi-nested stacks with one ScrollView per role (scroll-centric design).

3. **Offline-first caching** – Add React Query persistor and AsyncStorage; cache GET /lessons/active and queued answers for replay.

4. **Single-screen knowledge graph** – Replace heavy graph libraries with d3-force mini; fetch graph data once, memoize, and render in `<Svg>`.

5. **Parent data portability** – Add /api/export endpoint to export a learner's complete data (users, lessons, graph).

6. **CI sanity gate** – Set up GitHub Actions: lint, type-check, unit tests, migration-apply, and Playwright smoke test.

7. **Remove legacy UI state** – Replace Redux toolkit with Context + TanStack Query.

8. **Telemetry lite** – Replace Google Analytics with self-hosted Plausible for page views only, toggled with ENABLE_STATS flag.

9. **Automated dependency updates** – Enable Renovate/Dependabot with tests required for major version updates.