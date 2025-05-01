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

7. ✅ **Shrink dependency surface** – Removed unused dependencies (react-native-reanimated, ws client on server). Kept only React Native core, TanStack Query, Drizzle ORM, and axios.

8. ✅ **Cut navigation bloat** – Simplified learner flow to *Home → Lesson → Quiz → Feedback*. Replaced multi-nested stacks with scroll-centric design.

9. ✅ **Offline-first caching** – Added React Query persistor and AsyncStorage; cache GET /lessons/active and other essential queries for offline support.

10. ✅ **Single-screen knowledge graph** – Replaced heavy graph libraries with d3-force mini; fetch graph data once, memoize, and render in `<Svg>`.

11. ✅ **Parent data portability** – Added /api/export endpoint to export a learner's complete data (users, lessons, graph) and implemented export button in parent dashboard.

12. ✅ **CI sanity gate** – Set up GitHub Actions with workflows for lint, type-check, unit tests, migration-apply, and Playwright smoke test.

13. ✅ **Remove legacy UI state** – Verified application already uses Context + TanStack Query architecture instead of Redux.

14. ✅ **Telemetry lite** – Implemented self-hosted Plausible for page views only using PlausibleAnalytics component, toggled with ENABLE_STATS flag.

15. ✅ **Automated dependency updates** – Enabled Renovate with configuration for automated updates and test requirements for major version updates.