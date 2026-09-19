# ==============================================================================
# UNIFIED DOCKERFILE (CodePlatform Server & Client in a Single File)
# Targets:
#   - docker build --target backend -t codeplatform-backend .
#   - docker build --target frontend -t codeplatform-frontend .
# ==============================================================================

# ------------------------------------------------------------------------------
# 0. COMMON BASE
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.23.0 --activate

# ==============================================================================
# SECTION A: NESTJS BACKEND (SERVER)
# ==============================================================================

# A1. Backend Dependencies & Prisma Generation
FROM base AS backend-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
COPY server/package.json ./server/package.json
COPY server/prisma ./server/prisma
RUN pnpm --filter server install --frozen-lockfile && pnpm --filter server run prisma:generate

# A2. Backend Build
FROM base AS backend-builder
WORKDIR /app
COPY --from=backend-deps /app/node_modules ./node_modules
COPY --from=backend-deps /app/server/node_modules ./server/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
COPY server/package.json server/tsconfig*.json server/nest-cli.json ./server/
COPY server/prisma ./server/prisma
COPY server/src ./server/src
RUN pnpm --filter server run build

# A3. Backend Production Runner Target
FROM node:22-alpine AS backend
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=8000

RUN addgroup --system --gid 1001 nestgroup && \
    adduser --system --uid 1001 nestuser && \
    chown -R nestuser:nestgroup /app

COPY --from=backend-deps --chown=nestuser:nestgroup /app/node_modules /app/node_modules
COPY --from=backend-deps --chown=nestuser:nestgroup /app/server/node_modules ./node_modules
COPY --from=backend-deps --chown=nestuser:nestgroup /app/server/prisma ./prisma
COPY --from=backend-builder --chown=nestuser:nestgroup /app/server/dist ./dist
COPY --from=backend-builder --chown=nestuser:nestgroup /app/server/package.json ./package.json

USER nestuser
EXPOSE 8000
CMD ["node", "dist/main"]

# ==============================================================================
# SECTION B: NEXT.JS FRONTEND (CLIENT)
# ==============================================================================

# B1. Frontend Dependencies
FROM base AS frontend-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
COPY client/package.json ./client/package.json
RUN pnpm --filter client install --frozen-lockfile

# B2. Frontend Build
FROM base AS frontend-builder
WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY --from=frontend-deps /app/client/node_modules ./client/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
COPY client/ ./client/

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm --filter client run build

# B3. Frontend Production Runner Target
FROM node:22-alpine AS frontend
WORKDIR /app/client

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=frontend-builder /app/client/public ./public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/client/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/client/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
