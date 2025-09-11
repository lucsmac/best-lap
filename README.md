# Best Lap - Performance Metrics Platform

A comprehensive monorepo solution for collecting and analyzing web performance metrics using cron jobs, background processing, and real-time dashboards.

## 🏗️ Architecture

This project uses a **hybrid development approach** - infrastructure services (PostgreSQL and Redis) run in Docker containers while applications run locally for optimal development experience.

### 📦 Monorepo Structure

- **apps/api** - Fastify-based REST API server with Swagger documentation
- **apps/metrics-collector** - Background service for collecting page metrics using cron jobs and BullMQ queues
- **apps/admin** - Administrative panel with Bull Board dashboard for queue monitoring
- **packages/core** - Shared business logic and utilities
- **packages/env** - Environment variable management
- **packages/infra** - Infrastructure layer with database (TypeORM + PostgreSQL) and Redis queues (BullMQ)

### 🛠️ Tech Stack

- **Backend**: Fastify, TypeORM, PostgreSQL (TimescaleDB), Redis, BullMQ
- **Validation**: Zod schemas with Fastify integration
- **Documentation**: Swagger/OpenAPI
- **Performance**: Lighthouse integration for metrics collection
- **Build**: tsup for TypeScript compilation
- **Monorepo**: Turborepo for task orchestration
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm 8.14+

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd best-lap
   pnpm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Start infrastructure services**
   ```bash
   pnpm infra:up
   ```

4. **Seed database (optional - for initial data)**
   ```bash
   pnpm --filter=@best-lap/infra db:seed
   ```

5. **Start all applications**
   ```bash
   pnpm dev
   ```

6. **Access services**
   - **API**: http://localhost:3333
   - **API Documentation**: http://localhost:3333/docs
   - **Admin Panel**: http://localhost:4000
   - **Bull Board Dashboard**: http://localhost:4000
   - **PostgreSQL**: localhost:5432
   - **Redis**: localhost:6379

## 📋 Available Scripts

### Core Development
- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications and packages
- `pnpm lint` - Run linting across all packages
- `pnpm check-types` - Run TypeScript type checking

### Production
- `pnpm start` - Start all applications in production mode (after build)
- `pnpm start:prod` - Complete production workflow (build + infra + start)

### Infrastructure Management
- `pnpm infra:up` - Start PostgreSQL and Redis in Docker
- `pnpm infra:down` - Stop infrastructure services
- `pnpm infra:logs` - View infrastructure services logs

### Individual Applications
- `pnpm admin` - Start only the admin panel
- `turbo dev --filter=api` - Run only the API application
- `turbo dev --filter=metrics-collector` - Run only the metrics collector
- `turbo build --filter=api` - Build only the API application

## 🔧 Configuration

### Environment Variables

The project uses a `.env` file in the root directory. Key variables:

```bash
# Application
NODE_ENV=development
API_PORT=3333

# Admin Panel
BULL_BOARD_PORT=4000
ADMIN_TOKEN=your-admin-token

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=best_lap

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Metrics Collection
COLLECT_METRICS_CRON_EXPRESSION='0 8,14,20 * * *'
WORKER_CONCURRENCY=10

# External APIs
GOOGLE_API_KEY=your-google-api-key
SEED_THEMES_URL=https://example.com/themes.json
```

## 🏭 Production Deployment

### Option 1: Local Production Build

**Quick Start (Recommended)**
```bash
pnpm start:prod
```

**Step by Step**
1. **Build applications**
   ```bash
   pnpm build
   ```

2. **Start infrastructure**
   ```bash
   pnpm infra:up
   ```

3. **Start all applications**
   ```bash
   pnpm start
   ```

### Option 2: Docker Production (Custom Setup)

Create your own production Docker setup based on your infrastructure requirements:

1. **Build applications locally**
   ```bash
   pnpm build
   ```

2. **Create production Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY dist/ ./dist/
   COPY node_modules/ ./node_modules/
   COPY package*.json ./
   CMD ["node", "dist/server.js"]
   ```

3. **Deploy with your preferred orchestration tool** (Docker Compose, Kubernetes, etc.)

## 🔍 API Documentation

The API includes comprehensive Swagger documentation available at:
- **Development**: http://localhost:3333/docs
- **Production**: `{your-api-url}/docs`

### Key Endpoints

- `GET /health` - Health check
- `GET /api/pages` - List tracked pages
- `GET /api/metrics` - Get performance metrics
- `POST /api/channels` - Create new channels

## 📊 Monitoring & Administration

### Bull Board Dashboard

Access the queue management dashboard at http://localhost:4000 to:
- Monitor background job queues
- View job statistics and failures
- Retry failed jobs
- Inspect job data

### Database Access

Connect to PostgreSQL using your preferred client:
```
Host: localhost
Port: 5432
Database: best_lap
Username: postgres
Password: postgres
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter=@best-lap/api test

# Run linting
pnpm lint

# Type checking
pnpm check-types
```

## 🤝 Development Workflow

1. **Start infrastructure**: `pnpm infra:up`
2. **Start development**: `pnpm dev`
3. **Make changes** - Hot reload is enabled
4. **Run tests**: `pnpm test`
5. **Check types**: `pnpm check-types`
6. **Lint code**: `pnpm lint`
7. **Build**: `pnpm build`

## 📚 Package Details

### @best-lap/api
REST API server built with Fastify, featuring:
- Type-safe routing with Zod validation
- Swagger/OpenAPI documentation
- Database integration with TypeORM
- Structured logging with Pino

### @best-lap/metrics-collector
Background service for:
- Scheduled metrics collection via cron jobs
- BullMQ job queue processing
- Lighthouse performance analysis
- Data persistence to TimescaleDB

### @best-lap/admin
Administrative interface providing:
- Bull Board queue dashboard
- Real-time queue monitoring
- Job management and debugging

### @best-lap/infra
Shared infrastructure layer:
- Database connection and configuration
- Redis queue setup
- TypeORM entity definitions
- Migration management

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3333  # API
   lsof -i :4000  # Admin
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   ```

2. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep timescaledb
   
   # View PostgreSQL logs
   pnpm infra:logs
   ```

3. **Redis connection issues**
   ```bash
   # Test Redis connection
   docker exec best-lap-redis redis-cli ping
   ```

4. **Permission issues with Docker**
   ```bash
   # Add user to docker group (Linux)
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

### Reset Development Environment

```bash
# Stop all services
pnpm infra:down

# Remove Docker volumes (this will delete data)
docker volume rm best-lap_timescaledb_data best-lap_redis_data

# Restart infrastructure
pnpm infra:up
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

For more detailed information, check the `CLAUDE.md` file for additional development guidance and architecture details.