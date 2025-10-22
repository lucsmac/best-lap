# Dockerfile for Web Dashboard (React + Vite)
# Multi-stage build: Build stage with Node.js + Production stage with Nginx

# ==========================================
# Stage 1: Build
# ==========================================
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.14.0

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
COPY apps/web/package.json ./apps/web/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY packages/ ./packages/
COPY config/ ./config/
COPY apps/web/ ./apps/web/

# Accept build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the web application
# Vite will embed VITE_API_URL into the build at build time
RUN pnpm build --filter=@best-lap/web

# ==========================================
# Stage 2: Production with Nginx
# ==========================================
FROM nginx:1.25-alpine

# Copy custom nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port 5173
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
