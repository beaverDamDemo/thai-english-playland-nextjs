# Thai English Playland

English-learning games for Thai beginners (children and adult beginners), organised into 5 zones:
Starter, Chiang Mai, The Golden Baht Casino, Phuket and Pattaya.

## How it's built

One **Next.js** app contains both the frontend and the backend. There is no separate backend server.

| Part | Where | What |
|---|---|---|
| Frontend | `app/` (pages), `app/_games/` (games), `app/_components/` | React pages and games (Phaser, SVG). Zone and lesson URLs live in `app/zones/`. |
| Backend | `app/api/` | API routes: auth, progress, achievements, stats. Shared server code is in `app/_lib/server/`. |
| Database | PostgreSQL | Accessed from the API routes with the `postgres` library (plain SQL). Schema: `db/init/*.sql`. |

Lessons and zones are defined in `app/_games/curriculum.ts`. The **Lesson Content** page (`/lesson-content`)
shows all the English each lesson teaches.

## Run locally

Requires Node.js and Docker (for the local database).

1. Create `.env.local` with `DATABASE_URL` pointing to the local database
   (`POSTGRES_DB`, `POSTGRES_USER` and `POSTGRES_PASSWORD` configure the Docker container).
2. `npm install`
3. First time only: `npm run db:start`, then `npm run db:schema` (starts the database and creates the tables)
4. `npm run dev`, then open http://localhost:4200

`npm run dev` starts the Docker database (`npm run db:start`) and the app. `npm run verify` runs the checks
(apostrophes, lint, type-check).

## Deployment

- **Hosting:** Vercel (project `english-lessons-maze`).
- **Production database:** PostgreSQL on Aiven. Its connection string is set as `DATABASE_URL` in the
  Vercel project's environment variables.
- **To deploy:** push to `master`. Vercel builds (`npm run build`, which runs `npm run verify` first) and
  deploys automatically.
- GitHub Actions (`.github/workflows/verify.yml`) runs the same checks on every push but does not deploy.
