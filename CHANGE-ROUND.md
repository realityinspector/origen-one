### Immediate refactor-and-harden checklist (ordered by impact ↘ effort)

1. ✅ **Swap session cookies for JWT** – Design spec calls for JWT auth but server/auth.ts implements passport-session storage. Replace `express-session` + Passport with `passport-jwt` (or drop Passport entirely), emit/verify JWT in a single middleware. 
   - COMPLETED: Implemented JWT authentication in server/auth.ts and server/middleware/auth.ts.

2. ✅ **Isolate AI providers behind a thin adapter** – `openrouter.ts` and `perplexity.ts` duplicate almost identical request/parse logic. Create `/services/ai.ts` with a pluggable driver map so the rest of the code sees one `generateLesson|Quiz|Graph` API.
   - COMPLETED: Created server/services/ai.ts with a unified interface to both providers.

3. **Shrink dependency surface** – `package-lock.json` shows ~200 transitive packages; many are dead weight (e.g. `react-native-reanimated`, `hammerjs`, `ws` client on server). Keep React Native core, TanStack Query, Drizzle ORM, axios, and remove everything unused in screens/services.

4. **Move Drizzle schema into migrations** – Schema is hard-coded in docs. Generate SQL with `drizzle-kit`, commit versioned migrations, add `npm run migrate` to `postinstall`.

5. **Cut navigation bloat** – Learner flow should be *Home → Lesson → Quiz → Feedback*. Replace multi-nested stacks with one ScrollView per role (design doc is intentionally scroll-centric).

6. **Offline-first caching** – Add React Query `persistor` and AsyncStorage; cache `GET /lessons/active` and queued answers for replay (design mobile-specific note).

7. **Single-screen knowledge graph** – Replace heavy graph libs with d3-force mini; pull `/api/users/graph` once and memoize, render in `<Svg>` (Parent + Learner screens already expect a simplified graph).

8. **Parent data portability** – Add `/api/export` that dumps a learner’s JSON (users, lessons, graph). Helps “parents own the data” goal.

9. ✅ **Feature flags** – Env-driven toggle for `USE_AI=0` to fall back to static generators (`generateStaticLesson` already exists).
   - COMPLETED: Implemented feature flags in server/config/flags.ts with USE_AI and ENABLE_STATS.

10. **CI sanity gate** – GitHub Actions: lint (`eslint --max-warnings=0`), type-check, unit tests, migration-apply, and Playwright smoke for login→lesson.

11. **Seed script** – `scripts/seed.ts` to create demo admin, parent, learner, and four static lessons; speeds viral try-outs.

12. **Replit Setup** – Minimal services: `node`, `postgres`, optional `redis` for rate-limit; expose `.env.example` with only OPENROUTER_API_KEY and DATABASE_URL.

13. **Remove legacy UI state** – Delete Redux toolkit boilerplate (Context + TanStack Query is enough).

14. **Telemetry lite** – Drop Google Analytics; add self-hosted Plausible via script tag for page views only (no PII), toggle with `ENABLE_STATS`.

15. **Automated dependency updates** – Enable Renovate/Built-in Dependabot; block major bumps until tests pass.

**Δ to the checklist**

2 → **Lock provider to OpenRouter with Llama models**

```ts
// src/services/ai.ts
import axios from "axios";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const HEADERS = (key: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`,
  "HTTP-Referer": "https://your-app.com", // required by OpenRouter
  "X-Title": "Adaptive-Tutor-MVP"
});

export async function chat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  { model = "meta-llama/70b-chat", temperature = 0.8 } = {}
) {
  const { data } = await axios.post(
    ENDPOINT,
    { model, messages, temperature, stream: false },
    { headers: HEADERS(process.env.OPENROUTER_API_KEY!) }
  );
  return data.choices[0].message.content as string;
}
```

- **Delete** `src/services/perplexity.ts`, erase all imports/usages.
- In `package.json`, `npm prune` unused deps (`openai`, `node-fetch`, etc. that were only for Perplexity).
- `.env.example` → keep only `OPENROUTER_API_KEY`.
- Any model selector UI → restrict list to Llama variants returned by `GET /models` if dynamic, else hard-code preferred model(s).

Everything else in the original 15-point list stands.