FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++ ca-certificates \
  && corepack enable && corepack prepare pnpm@10.31.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY tooling tooling
COPY libs/logger libs/logger
COPY apps/backend/chat apps/backend/chat

RUN node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); delete p.scripts.postinstall; fs.writeFileSync('package.json', JSON.stringify(p, null, 2));"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

RUN (cd /app/apps/backend/chat && pnpm exec prisma generate) & \
  (cd /app/libs/logger && pnpm exec tsc -b) & \
  wait

RUN cd apps/backend/chat && pnpm run build
RUN mkdir -p /app/apps/backend/chat/dist/generated && cp -r /app/apps/backend/chat/src/generated/prisma /app/apps/backend/chat/dist/generated/
RUN rm -rf /app/apps/backend/chat/src

RUN if [ -d "/app/libs/logger" ]; then \
  (cd /app/libs/logger && rm -rf src config node_modules tsconfig.json tsconfig.*.json *.ts 2>/dev/null; true); \
fi

RUN pnpm deploy --filter=chat --prod --legacy /prod/chat
RUN cp -r /app/apps/backend/chat/dist /prod/chat/dist

RUN find /prod/chat/node_modules -name "*.md" -delete \
  && find /prod/chat/node_modules -name "*.ts" -delete \
  && find /prod/chat/node_modules -name "*.tsbuildinfo" -delete \
  && find /prod/chat/node_modules -name "*.map" -delete \
  && find /prod/chat/node_modules -name "*.flow" -delete \
  && find /prod/chat/node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/node_modules -type d -name "doc" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/node_modules -type d -name "example" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/node_modules -type d -name "coverage" -exec rm -rf {} + 2>/dev/null || true \
  && find /prod/chat/dist -name "*.map" -delete \
  || true

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /prod/chat ./

EXPOSE 42069

ENV PORT=42069
CMD ["node", "dist/index.js"]
