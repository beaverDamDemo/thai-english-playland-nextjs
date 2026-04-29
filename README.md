This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

This app is ready for a standard Vercel deployment.

### One-time setup

1. Import the repository into Vercel.
2. Framework preset: `Next.js`.
3. Build command: `npm run build`.
4. Output setting: leave blank and let Vercel detect it.
5. Install command: `npm install`.

### Deployments

- Push to the default branch to trigger a new deployment.
- Pull requests can generate preview deployments automatically.

### Local production check

```bash
npm run build
npm run start
```

### Existing Vercel project

Deployment history is available here:
[Vercel Link](https://vercel.com/fjasdojf-2974s-projects/english-lessons-maze-nextjs/deployments)

---

# English Lessons Maze - Development Setup

## Database Setup

### Local Development (Docker PostgreSQL)

This project uses Docker Compose to run a local PostgreSQL database for development.

#### Environment Files

- `.env.local` - Contains database connection string
- Database: `DATABASE_URL=postgresql://postgres:password@localhost:5432/pg_db_local?schema=public`

**Note:** All tables use the prefix `thai_english_playland_` to keep data organized when sharing a database with other projects.

#### Available Scripts

**Run Development Server:**

```bash
npm run dev
```

Make sure the `DATABASE_URL` environment variable is set in `.env.local`.

**Database Management:**

```bash
npm run db:start    # Start PostgreSQL container
npm run db:stop     # Stop PostgreSQL container
npm run db:reset    # Reset database (delete all data)
npm run db:logs     # View database logs
```

#### Manual Database Setup (if needed)

If you prefer to run the database manually:

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Wait for database to initialize (15-20 seconds)

3. Run the development server:

```bash
npm run dev
```

#### Database Schema

The database schema is automatically created from `db/init/001_schema.sql` when the container starts.

#### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)

## Development Workflow

1. **First time setup:**

   ```bash
   npm run dev
   ```

2. **Daily development:**
   - Use `npm run dev` for development

3. **Reset database:**
   ```bash
   npm run db:reset
   ```

## Production Deployment

For production deployment, ensure the `DATABASE_URL` environment variable is set with your production database credentials.
