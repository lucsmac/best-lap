# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/metrics-collector/package.json ./apps/metrics-collector/package.json
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter @best-lap/metrics-collector build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/metrics-collector/dist ./apps/metrics-collector/dist
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/metrics-collector/package.json ./apps/metrics-collector/package.json

CMD ["pnpm", "--filter", "@best-lap/metrics-collector", "run", "start"]


