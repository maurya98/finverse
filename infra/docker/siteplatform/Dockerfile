FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++ ca-certificates

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

RUN node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); delete p.scripts.postinstall; fs.writeFileSync('package.json', JSON.stringify(p, null, 2));"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

RUN (cd /app/apps/backend/siteplatform && pnpm exec prisma generate) & \
  (cd /app/libs/logger && pnpm exec tsc -b) & \
  (cd /app/libs/utils && pnpm exec rimraf dist && pnpm exec tsc -b --force) & \
  (cd /app/libs/middlewares && pnpm exec rimraf dist tsconfig.tsbuildinfo && pnpm exec tsc -b) & \
  (cd /app/libs/cache && pnpm exec tsc -b) & \
  wait

RUN cd apps/backend/siteplatform && pnpm run build
RUN cp -r /app/apps/backend/siteplatform/src/databases/generated /app/apps/backend/siteplatform/dist/databases/
RUN rm -rf /app/apps/backend/siteplatform/src

RUN for lib in logger utils middlewares cache; do \
  if [ -d "/app/libs/$lib" ]; then \
    (cd /app/libs/$lib && rm -rf src config node_modules tsconfig.json tsconfig.*.json *.ts 2>/dev/null; true); \
  fi; \
done

RUN pnpm deploy --filter=siteplatform --prod --legacy /prod/siteplatform
RUN cp -r /app/apps/backend/siteplatform/dist /prod/siteplatform/dist

RUN find /prod/siteplatform/node_modules -name "*.md" -delete \
  && find /prod/siteplatform/node_modules -name "*.ts" -delete \
  && find /prod/siteplatform/node_modules -name "*.tsbuildinfo" -delete \
  && find /prod/siteplatform/node_modules -name "*.map" -delete \
  && find /prod/siteplatform/node_modules -name "*.flow" -delete \
  && find /prod/siteplatform/node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/node_modules -type d -name "doc" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/node_modules -type d -name "example" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/node_modules -type d -name "coverage" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/siteplatform/dist -name "*.map" -delete \
  || true

# RUN npm install -g terser \
#   && find /prod/siteplatform/dist /prod/siteplatform/node_modules/@finverse -name "*.js" -type f 2>/dev/null | while read f; do \
#   terser "$f" --comments false -o "${f}.tmp" && mv "${f}.tmp" "$f"; \
# done || true

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /prod/siteplatform ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/app.js"]
