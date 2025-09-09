# syntax=docker/dockerfile:1

########################
# Stage 1: Base
########################
FROM node:20-alpine AS base

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

########################
# Stage 2: Dependencies
########################
FROM base AS deps

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files
COPY apps/*/package.json ./apps/
COPY packages/*/package.json ./packages/
COPY config/*/package.json ./config/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

########################
# Stage 3: Build
########################
FROM deps AS build

# Copy source code
COPY . .

# Build all packages and apps
RUN pnpm build

########################
# Stage 4: API Runtime
########################
FROM base AS api

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/*/dist ./packages/

EXPOSE 3333

CMD ["node", "apps/api/dist/server.js"]

########################
# Stage 5: Metrics Collector Runtime
########################
FROM base AS collector

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/metrics-collector/package.json ./apps/metrics-collector/
COPY packages/*/package.json ./packages/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=build /app/apps/metrics-collector/dist ./apps/metrics-collector/dist
COPY --from=build /app/packages/*/dist ./packages/

CMD ["node", "apps/metrics-collector/dist/index.js"]

########################
# Stage 6: Bull Board Runtime
########################
FROM base AS bullboard

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/infra/package.json ./packages/infra/
COPY packages/*/package.json ./packages/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=build /app/packages/*/dist ./packages/

EXPOSE 4000

CMD ["node", "packages/infra/dist/queue/bull-board/server.js"]