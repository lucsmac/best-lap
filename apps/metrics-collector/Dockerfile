# Dockerfile for Metrics Collector application
# Multi-stage build optimized for EC2 instances

# Stage 1: Base with Chromium
FROM node:18-alpine AS base
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Stage 2: Dependencies
FROM base AS deps
RUN npm install -g pnpm@8.14.0
WORKDIR /app

# Copy only lock files and package.json files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/env/package.json ./packages/env/
COPY packages/infra/package.json ./packages/infra/
COPY config/eslint-config/package.json ./config/eslint-config/
COPY config/prettier/package.json ./config/prettier/
COPY config/typescript-config/package.json ./config/typescript-config/
COPY apps/metrics-collector/package.json ./apps/metrics-collector/

# Install dependencies - layer will be cached unless lockfile changes
RUN pnpm install --frozen-lockfile

# Stage 3: Builder
FROM base AS builder
RUN npm install -g pnpm@8.14.0
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/turbo.json ./turbo.json

# Copy source code
COPY packages/ ./packages/
COPY config/ ./config/
COPY apps/metrics-collector/ ./apps/metrics-collector/

# Build only the metrics-collector and required dependencies
RUN pnpm build --filter=@best-lap/metrics-collector

# Stage 4: Production runtime
FROM base AS runner
RUN npm install -g pnpm@8.14.0

# Create app user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/env/package.json ./packages/env/
COPY packages/infra/package.json ./packages/infra/
COPY apps/metrics-collector/package.json ./apps/metrics-collector/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/env/dist ./packages/env/dist
COPY --from=builder /app/packages/infra/dist ./packages/infra/dist
COPY --from=builder /app/apps/metrics-collector/dist ./apps/metrics-collector/dist

# Change ownership
RUN chown -R appuser:nodejs /app

USER appuser

# Optimized health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node.*apps/metrics-collector/dist/index.js" || exit 1

CMD ["node", "apps/metrics-collector/dist/index.js"]