# Dockerfile for API application
# Single-stage build with proper monorepo dependency resolution

FROM node:18-alpine

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
COPY apps/api/package.json ./apps/api/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY packages/ ./packages/
COPY config/ ./config/
COPY apps/api/ ./apps/api/

# Build the API application and its dependencies
RUN pnpm build --filter=@best-lap/api

# Remove dev dependencies to reduce image size
RUN pnpm install --prod --frozen-lockfile

# Change ownership of the app directory to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:3333/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>{process.exit(1)})"

# Start the application
CMD ["node", "apps/api/dist/server.js"]