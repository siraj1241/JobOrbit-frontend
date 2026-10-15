# 🌐 JobOrbit Frontend

React 18 + Vite 6 + React Router 7 frontend for the JobOrbit job board.
Connects to the [JobOrbit backend](https://github.com/siraj1241/JobOrbit-backend) (.NET 9 Web API).

## 🚀 Quick start

```bash
npm install
cp .env.example .env         # set VITE_API_URL to your backend
npm run dev                  # starts on http://localhost:3000
```

The backend runs on **http://localhost:5087** by default (see `launchSettings.json` in the backend repo).

## ⚙️ Environment variables

All variables must be prefixed with `VITE_`. The dev server loads `.env.development` automatically.

| Variable        | Default                              | Description                          |
|-----------------|--------------------------------------|--------------------------------------|
| `VITE_API_URL`  | `http://localhost:5087/api`          | Base URL of the backend API           |

For production, override at build time:

```bash
VITE_API_URL=https://api.joborbit.example.com/api npm run build
```

## 🏗️ Project structure

```
src/
├── lib/
│   ├── api.js              # Centralized HTTP client (base URL, auth, errors)
│   └── endpoints.js        # All backend routes in one place
│
├── services/
│   ├── authService.js      # login / register / me
│   └── jobsService.js      # search / external / sync / getById
│
├── hooks/
│   ├── useAuth.jsx         # Auth context + login/register/logout
│   └── useAsync.js         # Generic { data, loading, error, run } hook
│
├── utils/
│   └── jobPresentation.js  # Backend Job → JobCard props mapper
│
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── JobCard.jsx         # Renders both raw and mapped Job DTOs
│
├── pages/
│   ├── Home.jsx            # Landing — fetches 4 live jobs from backend
│   ├── Auth.jsx            # Login + Register (uses backend)
│   ├── Jobs.jsx            # Search external/cache, switchable source
│   └── Dashboard.jsx      # Trigger job sync + view fresh matches
│
└── App.jsx                 # Routes + AuthProvider
```

## 🔁 Backend integration map

| Frontend action                  | Backend endpoint                          |
|----------------------------------|--------------------------------------------|
| `login(email, password)`         | `POST /api/account/login`                 |
| `register(...)`                  | `POST /api/account/register`              |
| `getMe()` (auto on mount)        | `GET  /api/account/me`                    |
| Home page — `getExternalJobs`    | `GET  /api/jobs/external`                  |
| Jobs page — `searchJobs`         | `GET  /api/jobs`                          |
| Jobs page — `getExternalJobs`    | `GET  /api/jobs/external`                 |
| Dashboard — `syncJobs`           | `POST /api/jobs/sync?maxPages=2`          |

## 🧹 Design principles applied

1. **Single source of truth for base URL** — `src/lib/api.js` reads `VITE_API_URL` once, every service reuses it.
2. **Endpoints in one file** — `src/lib/endpoints.js`. Renaming a backend route touches one line.
3. **Services over inline fetches** — pages call service functions, never `fetch()` directly.
4. **Typed errors** — `ApiError` normalizes backend `ProblemDetails` into `{ message, status, detail }`.
5. **Presentation utils** — `jobPresentation.js` translates backend Job DTOs into UI props (initials, color, time-ago) without leaking that knowledge into components.
6. **No demo data fallback** — if the backend is unreachable, the error is surfaced to the user, not masked with mock jobs.
7. **No dead code** — removed the Google Identity loader and mock "applications" flow that had no backend counterpart.

## 🧪 Development

```bash
npm run dev      # start dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## 📦 Tech stack

- React 18
- Vite 6
- React Router 7
- lucide-react (icons)

---

## 🐳 Docker & Deploy to Render

### Build & run locally with Docker

```bash
docker build -t joborbit-web .
docker run -p 3000:80 \
  -e VITE_API_URL=http://localhost:5087/api \
  joborbit-web
```

The container listens on port **80** internally. Render maps its host port to 80.

### How runtime env vars work

Vite bakes `VITE_*` env vars into the bundle at **build time**, but Render injects env vars at **runtime**. We solve this with a 2-step pattern:

1. **At build time:** the Dockerfile builds with `VITE_API_URL="__VITE_API_URL_PLACEHOLDER__"`. The placeholder ends up in the minified JS bundle.
2. **At runtime:** `docker-entrypoint.sh` runs before nginx starts, replaces every occurrence of `__VITE_API_URL_PLACEHOLDER__` with the actual `$VITE_API_URL` env var (set by Render), then execs nginx.

This means **the same Docker image works in any environment** — staging, production, preview — without rebuilds.

### One-click Deploy to Render (Blueprint)

1. Push this repo to GitHub.
2. In Render Dashboard → **New → Blueprint** → pick the repo.
3. Set `VITE_API_URL` to your deployed backend URL, e.g. `https://joborbit-api.onrender.com/api`.

### Manual Deploy to Render (without Blueprint)

1. **New → Web Service** → pick the GitHub repo.
2. **Environment:** Docker.
3. **Dockerfile path:** `./Dockerfile`.
4. **Environment variables:**
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |

5. Render builds the image, runs `docker-entrypoint.sh` at startup which injects `VITE_API_URL` into the bundle, and serves the static files via nginx.

### Full stack with docker-compose

```bash
# from the parent dir that contains both repos
docker compose up --build
```

Frontend: http://localhost:3000, Backend: http://localhost:5087, Postgres: localhost:5432.
