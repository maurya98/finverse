# Deployment

Docker deployment for backend apps; frontend apps are build-only (static assets).

## Layout

- **`production/`** – Production server config and compose files.
- **`staging/`** – Staging server config and compose files.
- **`../docker/`** – Dockerfiles per backend: `ruleenginebe`, `siteplatform`, `lms`.

Database and Redis run on the server (not in Docker). Backend containers use `network_mode: host` so they connect to `localhost:5432` and `localhost:6379` on the server.

## One-time setup per environment

1. Choose environment: `production` or `staging`.
2. For each backend you deploy, create its env file from the example:
   - `cp production/ruleenginebe.env.example production/ruleenginebe.env`
   - `cp production/siteplatform.env.example production/siteplatform.env`
   - `cp production/lms.env.example production/lms.env`
3. Edit the `.env` files and set `DATABASE_URL`, `JWT_SECRET` (ruleenginebe), etc.
4. Ensure Postgres and Redis are running on the server and databases exist (e.g. `ruleengine`, `site_platform`, `lms` for production; use `_staging` DBs for staging if you prefer).

## Deploy from repo root

Use the root-level script:

```bash
# Deploy all backends (Docker) and build all frontends
./deploy.sh production
./deploy.sh staging

# Deploy a single backend
./deploy.sh production ruleenginebe
./deploy.sh staging siteplatform
./deploy.sh production lms

# Build a single frontend (no Docker)
./deploy.sh production ruleenginefe
./deploy.sh staging admin_dashboard
```

Script must be run from the monorepo root. Backend images are built with context at repo root so workspace dependencies are included.

## Manual Docker commands (production example)

From monorepo root:

```bash
# Rule Engine BE
docker compose -f infra/deployment/production/docker-compose.ruleenginebe.yml \
  --env-file infra/deployment/production/ruleenginebe.env \
  build && \
docker compose -f infra/deployment/production/docker-compose.ruleenginebe.yml \
  --env-file infra/deployment/production/ruleenginebe.env \
  up -d

# Site Platform
docker compose -f infra/deployment/production/docker-compose.siteplatform.yml \
  --env-file infra/deployment/production/siteplatform.env \
  build && up -d

# LMS
docker compose -f infra/deployment/production/docker-compose.lms.yml \
  --env-file infra/deployment/production/lms.env \
  build && up -d
```

## Frontend

Frontends are not run in Docker here. Use `./deploy.sh <env> ruleenginefe` or `./deploy.sh <env> admin_dashboard` to build. Output is under `apps/frontend/<app>/dist`. Serve with your web server (e.g. nginx) or static host.

## Ports (with network_mode: host)

- Rule Engine BE: 3000  
- Site Platform: 3001  
- LMS: 3002  

Ensure these ports are free on the server when using `network_mode: host`.
