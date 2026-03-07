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
COPY apps/backend/ruleenginebe apps/backend/ruleenginebe

RUN node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); delete p.scripts.postinstall; fs.writeFileSync('package.json', JSON.stringify(p, null, 2));"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

RUN (cd /app/apps/backend/ruleenginebe && pnpm exec prisma generate) & \
  (cd /app/libs/logger && pnpm exec tsc -b) & \
  (cd /app/libs/utils && pnpm exec rimraf dist && pnpm exec tsc -b --force) & \
  (cd /app/libs/middlewares && pnpm exec rimraf dist tsconfig.tsbuildinfo && pnpm exec tsc -b) & \
  wait

RUN cd apps/backend/ruleenginebe && pnpm run build
RUN cp -r /app/apps/backend/ruleenginebe/src/databases/generated /app/apps/backend/ruleenginebe/dist/databases/
RUN rm -rf /app/apps/backend/ruleenginebe/src

RUN for lib in logger utils middlewares; do \
  if [ -d "/app/libs/$lib" ]; then \
    (cd /app/libs/$lib && rm -rf src config node_modules tsconfig.json tsconfig.*.json *.ts 2>/dev/null; true); \
  fi; \
done

RUN pnpm deploy --filter=ruleenginebe --prod --legacy /prod/ruleenginebe
RUN cp -r /app/apps/backend/ruleenginebe/dist /prod/ruleenginebe/dist

RUN find /prod/ruleenginebe/node_modules -name "*.md" -delete \
  && find /prod/ruleenginebe/node_modules -name "*.ts" -delete \
  && find /prod/ruleenginebe/node_modules -name "*.tsbuildinfo" -delete \
  && find /prod/ruleenginebe/node_modules -name "*.map" -delete \
  && find /prod/ruleenginebe/node_modules -name "*.flow" -delete \
  && find /prod/ruleenginebe/node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/node_modules -type d -name "doc" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/node_modules -type d -name "example" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/node_modules -type d -name "coverage" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/ruleenginebe/dist -name "*.map" -delete \
  || true

# RUN npm install -g terser \
#   && find /prod/ruleenginebe/dist /prod/ruleenginebe/node_modules/@finverse -name "*.js" -type f 2>/dev/null | while read f; do \
#   terser "$f" --comments false -o "${f}.tmp" && mv "${f}.tmp" "$f"; \
# done || true

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /prod/ruleenginebe ./

EXPOSE 5000

CMD ["node", "dist/app.js"]
