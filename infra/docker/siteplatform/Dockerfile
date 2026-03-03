# Build stage
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY tooling tooling
COPY libs/logger libs/logger
COPY libs/middlewares libs/middlewares
COPY libs/utils libs/utils
COPY libs/cache libs/cache
COPY apps/backend/siteplatform apps/backend/siteplatform

RUN pnpm install --no-frozen-lockfile
RUN cd apps/backend/siteplatform && pnpm exec prisma generate
# Build libs (compile only, skip tests — tooling copied for tsconfig extends)
RUN cd libs/logger && pnpm exec tsc -b
RUN cd libs/utils && pnpm exec rimraf dist && pnpm exec tsc -b --force
RUN cd libs/middlewares && pnpm exec rimraf dist tsconfig.tsbuildinfo && pnpm exec tsc -b
RUN cd libs/cache && pnpm exec tsc

# Build app (run from app dir so only this package's build runs)
RUN cd apps/backend/siteplatform && pnpm run build
RUN cp -r /app/apps/backend/siteplatform/src/databases/generated /app/apps/backend/siteplatform/dist/databases/

# Production stage
FROM node:22-slim AS runner

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY libs/logger libs/logger
COPY libs/middlewares libs/middlewares
COPY libs/utils libs/utils
COPY libs/cache libs/cache
COPY apps/backend/siteplatform apps/backend/siteplatform

COPY --from=builder /app/apps/backend/siteplatform/src/databases/generated apps/backend/siteplatform/src/databases/generated
COPY --from=builder /app/libs/logger/dist libs/logger/dist
COPY --from=builder /app/libs/middlewares/dist libs/middlewares/dist
COPY --from=builder /app/libs/utils/dist libs/utils/dist
COPY --from=builder /app/libs/cache/dist libs/cache/dist
COPY --from=builder /app/apps/backend/siteplatform/dist apps/backend/siteplatform/dist
COPY --from=builder /app/node_modules node_modules
# App node_modules has Prisma runtime deps — required when running from app dir
COPY --from=builder /app/apps/backend/siteplatform/node_modules apps/backend/siteplatform/node_modules

RUN cp -r /app/apps/backend/siteplatform/node_modules/.prisma /app/node_modules/ 2>/dev/null || true

ENV NODE_ENV=production
WORKDIR /app/apps/backend/siteplatform

EXPOSE 3001

CMD ["node", "dist/app.js"]
