# Golden Task Tests (API)

## Setup

### 1) Postgres bereitstellen

Du brauchst eine Postgres-DB und eine gesetzte `DATABASE_URL` für `apps/api`.

### 2) Migrationen anwenden

Die Golden Tests erwarten, dass das Schema bereits existiert (insb. `projects`, `decisions`, `action_logs`, `review_requests`).

Nutze die im Repo dokumentierten SQL-Migrationen:

```bash
psql -d your_database -f infrastructure/db/migrations/001_init.sql
psql -d your_database -f infrastructure/db/migrations/002_review_commit_token.sql
psql -d your_database -f infrastructure/db/migrations/003_decisions_domain.sql
```

### 3) Env setzen

- `DATABASE_URL` (required)
- `TEST_PROJECT_ID` (optional, default: `proj_test`)
- `TEST_CLIENT_ID` (optional, default: `client_test`)

Hinweis: Der Seed wird **automatisch** von den Golden Tests ausgeführt und ist idempotent.

### 4) Tests laufen lassen

```bash
pnpm -C apps/api test:golden
```

