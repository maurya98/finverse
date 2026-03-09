#!/usr/bin/env bash
set -e

# Deployment script for finverse-monorepo
# Run without arguments for interactive prompts:
#   ./deploy.sh
#
# Or with arguments: ./deploy.sh <staging|production> [app]
#
# Prerequisites:
#   - Database and Redis run on the server (localhost). Backend containers use network_mode: host.
#   - Copy env examples to .env in the target folder, e.g.:
#       cp infra/deployment/production/ruleenginebe.env.example infra/deployment/production/ruleenginebe.env
#     and fill in DATABASE_URL, JWT_SECRET, etc.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
INFRA="$ROOT_DIR/infra/deployment"

BACKENDS=(ruleenginebe siteplatform lms iam customer)
FRONTENDS=(ruleenginefe admin_dashboard)

usage() {
  echo "Usage: $0 [staging|production] [app]"
  echo ""
  echo "Run without arguments for interactive prompts."
  echo "Environments: staging, production"
  echo "Apps (backend): ruleenginebe, siteplatform, lms, iam, customer"
  echo "Apps (frontend, build only): ruleenginefe, admin_dashboard"
  echo "App 'all': deploy all backends and build all frontends."
  exit 1
}

prompt_env() {
  echo "" >&2
  echo "Select environment:" >&2
  echo "  1) staging" >&2
  echo "  2) production" >&2
  echo "" >&2
  read -r -p "Enter choice [1-2]: " choice
  case "$choice" in
    1) echo "staging" ;;
    2) echo "production" ;;
    *)
      echo "Invalid choice." >&2
      exit 1
      ;;
  esac
}

prompt_app() {
  echo "" >&2
  echo "Select application:" >&2
  echo "  1) All (all backends + all frontends)" >&2
  echo "  2) ruleenginebe (Rule Engine backend)" >&2
  echo "  3) siteplatform (Site Platform backend)" >&2
  echo "  4) lms (LMS backend)" >&2
  echo "  5) ruleenginefe (Rule Engine frontend - build only)" >&2
  echo "  6) admin_dashboard (Admin Dashboard frontend - build only)" >&2
  echo "  7) iam (IAM backend)" >&2
  echo "  8) customer (Customer backend)" >&2
  echo "" >&2
  read -r -p "Enter choice [1-8]: " choice
  case "$choice" in
    1) echo "all" ;;
    2) echo "ruleenginebe" ;;
    3) echo "siteplatform" ;;
    4) echo "lms" ;;
    5) echo "ruleenginefe" ;;
    6) echo "admin_dashboard" ;;
    7) echo "iam" ;;
    8) echo "customer" ;;
    *)
      echo "Invalid choice." >&2
      exit 1
      ;;
  esac
}

deploy_backend() {
  local env="$1"
  local app="$2"
  local compose_file="$INFRA/$env/docker-compose.$app.yml"
  local env_file="$INFRA/$env/$app.env"

  if [[ ! -f "$compose_file" ]]; then
    echo "Compose file not found: $compose_file"
    exit 1
  fi
  if [[ ! -f "$env_file" ]]; then
    echo "Env file not found: $env_file"
    echo "Copy from $env_file.example and fill in values."
    exit 1
  fi

  echo "Building and starting $app ($env)..."
  (cd "$ROOT_DIR" && docker compose -f "$compose_file" --env-file "$env_file" build --no-cache && docker compose -f "$compose_file" --env-file "$env_file" up -d)
  echo "Done: $app ($env)"
}

build_frontend() {
  local app="$1"
  echo "Building frontend: $app"
  (cd "$ROOT_DIR" && pnpm build --filter="$app")
  echo "Done: $app (output in apps/frontend/$app/dist)"
}

main() {
  local env
  local app

  if [[ $# -ge 1 ]]; then
    env="$1"
    app="${2:-all}"
    if [[ "$env" != "staging" && "$env" != "production" ]]; then
      usage
    fi
  else
    env=$(prompt_env)
    app=$(prompt_app)
  fi

  if [[ ! -d "$INFRA/$env" ]]; then
    echo "Environment directory not found: $INFRA/$env"
    exit 1
  fi

  echo ""
  echo "Deploying: environment=$env, app=$app"
  echo ""

  if [[ "$app" == "all" ]]; then
    for b in "${BACKENDS[@]}"; do
      deploy_backend "$env" "$b"
    done
    for f in "${FRONTENDS[@]}"; do
      build_frontend "$f"
    done
    echo ""
    echo "All deployments complete."
    exit 0
  fi

  if [[ "$app" == "ruleenginebe" || "$app" == "siteplatform" || "$app" == "lms" || "$app" == "iam" || "$app" == "customer" ]]; then
    deploy_backend "$env" "$app"
    exit 0
  fi

  if [[ "$app" == "ruleenginefe" || "$app" == "admin_dashboard" ]]; then
    build_frontend "$app"
    exit 0
  fi

  echo "Unknown app: $app"
  usage
}

main "$@"
