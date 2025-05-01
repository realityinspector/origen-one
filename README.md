# Adaptive Tutor MVP

Lean open-source prototype for adaptive learning.  
Single backend + web client, minimal dependencies, parent-controlled data.

---

## Vision

- Generate lessons, quizzes, and feedback with **Llama-70B via OpenRouter** only.  
- Persist each learner’s activity as a **versioned knowledge graph**.  
- **Parents own exportable data** (one-click JSON dump).  
- Works offline, syncs when online.  
- Viral trial path: clone → set API key → seed script → run.

---

## Feature Matrix

| Domain            | Function                                                                       | Path / Module                             |
|-------------------|--------------------------------------------------------------------------------|-------------------------------------------|
| Auth & Identity   | JWT (`HS256`), roles: **admin, parent, learner**                                | `src/middleware/auth.ts`                  |
| Lesson Engine     | `POST /ai/lesson` → returns adaptive lesson JSON (OpenRouter Llama)            | `src/routes/ai.ts`                        |
| Quiz Engine       | `POST /ai/quiz` → generates quiz from lesson context                           | `src/routes/ai.ts`                        |
| Feedback Engine   | `POST /ai/feedback` → formative feedback on quiz attempt                        | `src/routes/ai.ts`                        |
| Knowledge Graph   | `GET /graph` (viewer), `PATCH /graph` (update), GraphQL-like queries soon      | `src/services/graph.ts`                   |
| Offline Cache     | React Query + AsyncStorage, replay queue for POSTs                             | `app/hooks/useOnlineQueue.ts`             |
| Data Export       | `GET /export` → zipped JSON of user, lessons, graph                            | `src/routes/export.ts`                    |
| Seed Script       | Demo admin / parent / learner + 4 static lessons                               | `scripts/seed.ts`                         |
| Feature Flags     | `USE_AI`, `ENABLE_STATS` env toggles                                           | `src/config/flags.ts`                     |
| Telemetry Lite    | Plausible page-view only (no PII)                                              | `public/_plausible.js`                    |
| CI Gate           | ESLint ▸ TypeScript ▸ Unit tests ▸ Migrations ▸ Playwright smoke               | `.github/workflows/ci.yml`                |

---

## Stack

* **Backend:** Node 20, Fastify, Drizzle ORM (Postgres), Zod  
* **AI:** OpenRouter ➜ `meta-llama/70b-chat` (switchable with `model=` param)  
* **Frontend:** React 18, Vite, TanStack Query, d3-force (graph)  
* **Auth:** jsonwebtoken, bcrypt  
* **DX:** ESLint, Prettier, Vitest, Playwright  
* **Infra:** Docker Compose (`node`, `postgres`, optional `redis`), GitHub Actions CI

---

## Repo Layout

```
/
├─ app/                   # React client
├─ src/                   # Fastify server
│  ├─ routes/             # REST endpoints
│  ├─ services/           # AI, graph, db adapters
│  └─ middleware/         # auth, error, rate-limit
├─ drizzle/               # SQL migrations
├─ scripts/               # tooling (seed, dev-helpers)
├─ .github/               # CI pipeline
└─ docker-compose.yml
```

---

## Quick Start

```bash
git clone https://github.com/your-org/adaptive-tutor.git
cd adaptive-tutor
cp .env.example .env               # add your OPENROUTER_API_KEY
docker compose up -d db
npm install
npm run migrate                    # drizzle-kit
npm run seed                       # demo data
npm run dev                        # Vite + Fastify w/ HMR
```

API docs live at `http://localhost:3000/docs` (OpenAPI autogen).

---

## Environment Variables

| Key                 | Example                  | Notes                                   |
|---------------------|--------------------------|-----------------------------------------|
| `OPENROUTER_API_KEY`| sk-or-************************ | **required**                           |
| `DATABASE_URL`      | postgres://user:pw@db/app | set by docker-compose for local dev     |
| `JWT_SECRET`        | supersecret              | rotate in prod                          |
| `USE_AI`            | `1`                      | `0` → static generators                 |
| `ENABLE_STATS`      | `1`                      | `0` → no Plausible                      |

---

## API Surface (essential)

| Method | Path                | Description                     |
|--------|---------------------|---------------------------------|
| POST   | /auth/login         | email, password → JWT           |
| GET    | /lessons/active     | current lesson for learner      |
| POST   | /ai/lesson          | topic, level → lesson JSON      |
| POST   | /ai/quiz            | lessonId → quiz JSON            |
| POST   | /ai/feedback        | quizId, answers → feedback      |
| GET    | /graph              | learner graph                   |
| PATCH  | /graph              | upsert edge/vertex              |
| GET    | /export             | zip of all learner data         |

---

## Dev Commands

```
npm run lint           # strict eslint (no warnings)
npm run test           # vitest unit + integration
npm run e2e            # playwright smoke suite
npm run migrate        # apply pending drizzle migrations
npm run gen            # drizzle-kit generate types
```

---

## Roadmap

- Mobile build (Expo) sharing 95 % of codebase
- Real-time collaborative graph editing (Socket.IO)
- Role-based granular data export (per module)
- AI-explainability overlay (token attributions)

---

## Contributing

1. Fork → feature branch → PR.  
2. Commit lint + tests must pass.  
3. Follow `CONTRIBUTING.md` coding standards.

---

## License

MIT
