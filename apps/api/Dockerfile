# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

# Install deps with workspace context
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter @best-lap/api build

# Runtime
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

# Copy only built artifact and necessary node_modules
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3333
CMD ["pnpm", "--filter", "@best-lap/api", "run", "start"]


