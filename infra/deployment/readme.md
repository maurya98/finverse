# Deployment

Docker deployment for backend apps; frontend apps are build-only (static assets).

## Layout

- **`production/`** – Production server config and compose files.
- **`staging/`** – Staging server config and compose files.
- **`../docker/`** – Dockerfiles per backend: `ruleenginebe`, `siteplatform`, `lms`, `iam`, `customer`.

Database and Redis run on the server (not in Docker). Backend containers use `network_mode: host` so they connect to `localhost:5432` and `localhost:6379` on the server.

## One-time setup per environment

1. Choose environment: `production` or `staging`.
2. For each backend you deploy, create its env file from the example:
   - `cp production/ruleenginebe.env.example production/ruleenginebe.env`
   - `cp production/siteplatform.env.example production/siteplatform.env`
   - `cp production/lms.env.example production/lms.env`
   - `cp production/customer.env.example production/customer.env`
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
./deploy.sh production customer
./deploy.sh staging customer

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

# Customer
docker compose -f infra/deployment/production/docker-compose.customer.yml \
  --env-file infra/deployment/production/customer.env \
  build && up -d
```

## Frontend

Frontends are not run in Docker here. Use `./deploy.sh <env> ruleenginefe` or `./deploy.sh <env> admin_dashboard` to build. Output is under `apps/frontend/<app>/dist`. Serve with your web server (e.g. nginx) or static host.

## Ports (with network_mode: host)

- Rule Engine BE: 5000  
- Site Platform: 3001  
- LMS: 3002  
- Customer: 5000  

Ensure these ports are free on the server when using `network_mode: host`. (If Customer and Rule Engine BE both use 5000, run them on different hosts or change one app’s PORT.)

## Troubleshooting

### Database not reachable (P1001) — host 172.17.0.1

If the app in the container fails with `PrismaClientKnownRequestError` / `DatabaseNotReachable` and the host is **172.17.0.1**:

1. **Linux with `network_mode: host`**  
   Use **localhost** in `DATABASE_URL`, not `172.17.0.1`. Postgres usually listens only on `127.0.0.1`; the Docker bridge IP may not accept connections.

2. **Mac/Windows (Docker Desktop)**  
   `network_mode: host` does not share the host network. In `siteplatform.env` (or the env file for the backend) set:
   - `DATABASE_URL=postgresql://USER:PASSWORD@host.docker.internal:5432/DBNAME`
   - `REDIS_HOST=host.docker.internal`

3. Ensure Postgres is running on the host and allows connections (e.g. `listen_addresses` and `pg_hba.conf` if not using host network).
