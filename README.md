![Status](https://img.shields.io/badge/status-active_development-orange)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![License](https://img.shields.io/badge/License-MIT-green)

# Growlog

Growlog is a full-stack productivity tracker for converting daily intent into durable execution logs. Users can register, add and complete tasks, review weekly or monthly analytics, and optionally sync generated progress logs to a GitHub repository.

## Highlights

- FastAPI backend with token-based authentication and task, analytics, and repository endpoints
- Next.js frontend with a dashboard for task capture, completion tracking, and productivity insights
- Daily and monthly log generation designed for personal accountability and Git-backed journaling
- Test coverage for task-domain rules and authenticated API flows

## Architecture

```text
frontend/   Next.js 16 app router UI
backend/    FastAPI application, SQLAlchemy models, services, and tests
logs/       Generated local logs used during development
```

Backend responsibilities:

- authentication and user profile management
- task creation, listing, and completion
- analytics aggregation for dashboard charts
- log regeneration and optional Git sync

Frontend responsibilities:

- authentication screens
- dashboard, settings, and repository setup flows
- task and analytics data fetching
- interactive productivity UI components

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, Passlib, python-jose
- Frontend: Next.js, React, TypeScript, TanStack Query, Tailwind CSS
- Database: PostgreSQL in local/prod configuration, SQLite for tests

## Project Structure

```text
backend/
  main.py                 FastAPI entrypoint
  routers/                HTTP routes
  services/               Business logic
  models/                 SQLAlchemy models
  schemas/                Request and response contracts
  tests/                  Unit and integration coverage

frontend/
  src/app/                App Router pages
  src/components/         UI and layout components
  src/features/           API hooks and feature logic
```

## Local Development

### 1. Backend

Create a virtual environment, install dependencies, and run the API:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
# install the backend dependencies used by your local environment
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Note: the repository currently does not include a backend lockfile, so dependency installation is environment-managed.

### 2. Frontend

Install packages and start the Next.js app:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Configuration

Backend configuration is environment-driven:

- `GROWLOG_ENV`
- `GROWLOG_DATABASE_URL`
- `GROWLOG_JWT_SECRET`
- `GROWLOG_JWT_ALGORITHM`
- `GROWLOG_ACCESS_TOKEN_EXPIRE_MINUTES`
- `GROWLOG_CORS_ORIGINS`
- `GROWLOG_LOG_LEVEL`
- `GROWLOG_ENABLE_GIT_PUSH`

Example:

```powershell
$env:GROWLOG_DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/growlog"
$env:GROWLOG_JWT_SECRET="replace-me"
$env:GROWLOG_CORS_ORIGINS="http://localhost:3000"
$env:GROWLOG_ENV="development"
```

Security notes:

- `GROWLOG_JWT_SECRET` is required in staging and production. Development still boots with a fallback secret, but it logs a warning and should not be relied on outside local work.
- `GROWLOG_DATABASE_URL` is required in staging and production.
- Repository sync now accepts only `https://github.com/<owner>/<repo>` style URLs and normalizes them to a `.git` remote.
- `GROWLOG_ENABLE_GIT_PUSH=false` disables outbound git pushes while keeping local log generation intact.

## Testing

Backend tests are designed to run against SQLite automatically:

```powershell
.\backend\venv\Scripts\python.exe -m unittest discover backend/tests
```

Current coverage includes:

- task title normalization, deduplication, and validation
- idempotent completion behavior
- weekly analytics correctness
- authenticated API integration tests for register, login, tasks, and analytics

## API Surface

Core endpoints:

- `POST /register`
- `POST /login`
- `GET /user/me`
- `POST /set-repo`
- `POST /tasks/create`
- `GET /tasks/pending`
- `GET /tasks/completed`
- `PUT /tasks/complete/{task_id}`
- `GET /analytics/weekly`
- `GET /analytics/monthly`

## Engineering Notes

- The backend separates routers, schemas, and services to keep HTTP concerns out of business logic.
- Task creation accepts batched input and normalizes titles consistently before persistence.
- Tests pin the backend to an isolated SQLite database so CI and local runs are deterministic.
- Error responses now use a consistent envelope and every response includes an `X-Request-ID` header for tracing.
- Git automation is time-bounded and best-effort so a remote push cannot hang the request path indefinitely.

## Roadmap

- structured API error envelopes and request tracing
- database migrations with Alembic
- stronger repository sync observability
- deployment and CI automation

## License

This project currently has no declared license.
