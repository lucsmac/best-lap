# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY packages/infra/package.json ./packages/infra/package.json
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile --prod=false && \
    pnpm store prune

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter @best-lap/infra build:bull-board && \
    rm -rf node_modules/.cache && \
    rm -rf node_modules/.pnpm-store

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/packages/infra/dist ./packages/infra/dist
COPY --from=build /app/packages/infra/package.json ./packages/infra/package.json
EXPOSE 4000
CMD ["pnpm", "--filter", "@best-lap/infra", "run", "start:bull-board:prod"]


