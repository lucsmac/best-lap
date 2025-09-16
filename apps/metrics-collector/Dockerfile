# Dockerfile for Metrics Collector application
# Single-stage build with Chromium for Lighthouse

FROM node:18-alpine

# Install Chromium for Lighthouse
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chromium since it's already available
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Create app user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy workspace configuration files first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy all package.json files for dependency resolution
COPY packages/core/package.json ./packages/core/
COPY packages/env/package.json ./packages/env/
COPY packages/infra/package.json ./packages/infra/
COPY config/eslint-config/package.json ./config/eslint-config/
COPY config/prettier/package.json ./config/prettier/
COPY config/typescript-config/package.json ./config/typescript-config/
COPY apps/metrics-collector/package.json ./apps/metrics-collector/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY packages/ ./packages/
COPY config/ ./config/
COPY apps/metrics-collector/ ./apps/metrics-collector/

# Build the metrics-collector application and its dependencies
RUN pnpm build --filter=@best-lap/metrics-collector

# Remove dev dependencies to reduce image size
RUN pnpm install --prod --frozen-lockfile

# Change ownership of the app directory to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Health check (basic process check since this is a background service)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node.*apps/metrics-collector/dist/index.js" || exit 1

# Start the application
CMD ["node", "apps/metrics-collector/dist/index.js"]