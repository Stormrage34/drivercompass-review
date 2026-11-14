# DriverCompass — code review snapshot

Pre-launch Next.js/TypeScript application for comparing structured international C+E vacancies and
contacting employers directly. This is a **code review snapshot**, not a deployed product.

## What is included

- Application source in `src/`
- Unit/DB and HTTP tests in `tests/`
- Drizzle schema and migrations
- Static assets, scripts and configuration
- `.env.example` with safe placeholders

## What is deliberately excluded

Internal legal, commercial and business documents; founder-only audits; local env files; build
artifacts; dependency directories.

## Review focus

1. Authentication, session handling and role guards.
2. Email-confirmed account deletion and anonymisation.
3. Tenant/ownership scoping in employer and admin server actions.
4. Input validation and SQL construction.
5. The gross minimum/maximum pay rule and vacancy publication state machine.
6. Test quality and any missing negative cases.
7. Code structure: the employer action module is large; revalidation paths are repeated.

## Run it

```bash
npm install
cp .env.example .env
# Set DATABASE_URL to a disposable PostgreSQL 16+ database
npm run db:migrate
npm run typecheck
npm test
npm run build
npm run test:http   # requires the build
```

Email delivery is disabled by default. `EMAIL_PROVIDER=test` captures messages in memory and is
only accepted outside production.

## Known limitations

- No deployment, TLS, production email, backup, monitoring or scheduler is included.
- Demo companies/vacancies are fictional and labelled; do not treat them as real employers.
- Reviews, contact and public reporting are intentionally closed.
- Rate limiting is in-memory; admin MFA is not implemented.
- Legal and retention decisions are outside this snapshot.
