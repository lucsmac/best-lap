# Deploy Guide - Best Lap Production

## Prerequisites
- Docker and Docker Compose installed on EC2
- Ports 3333 (API) and 4000 (Bull Board) open in security group

## Environment Setup
Create a `.env` file in the root directory with:

```bash
# Environment
NODE_ENV=production

# API Configuration
SERVER_PORT=3333

# Bull Board Configuration
BULL_BOARD_PORT=4000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=metrics

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Google API (optional)
GOOGLE_API_KEY=

# Metrics Collection
COLLECT_METRICS_CRON_EXPRESSION=0 8,14,20 * * *
SEED_THEMES_URL=https://lucsmac.github.io/autodromo-domains/full_data.json
WORKER_CONCURRENCY=10
```

**Note**: The services will use the environment variables from the `.env` file, but in production Docker containers, these are also explicitly set in the docker-compose.prod.yml file.

## Deploy
1. Build and start all services:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**After making changes to Dockerfiles or package.json files, you need to rebuild:**
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

2. Check service status:
```bash
docker compose -f docker-compose.prod.yml ps
```

3. View logs:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

## Seed Database (Optional)
Run the seed service to populate initial data:
```bash
docker compose -f docker-compose.prod.yml run --rm seed
```

## Access Services
- **API**: http://<EC2_PUBLIC_IP>:3333
- **Bull Board**: http://<EC2_PUBLIC_IP>:4000
- **API Docs**: http://<EC2_PUBLIC_IP>:3333/docs

## Troubleshooting
- Check logs: `docker compose -f docker-compose.prod.yml logs <service_name>`
- Restart service: `docker compose -f docker-compose.prod.yml restart <service_name>`
- Rebuild: `docker compose -f docker-compose.prod.yml up -d --build <service_name>`

## Services
- **postgres**: TimescaleDB database
- **redis**: Redis for queues
- **api**: Fastify API server on port 3333
- **collector**: Metrics collection service
- **bullboard**: Bull MQ dashboard on port 4000
- **seed**: One-time database seeding service
