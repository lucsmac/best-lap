# EC2 Deployment Guide

## Overview

This guide provides optimized deployment instructions for running Best Lap backend services on EC2 instances. The deployment is optimized for low-resource instances and uses multi-stage Docker builds with aggressive caching.

## Architecture for EC2

### Services Running on EC2:
- **API** - Fastify REST API server
- **Admin Panel** - Bull Board dashboard for queue monitoring
- **Metrics Collector** - Background service for collecting metrics
- **TimescaleDB** - PostgreSQL database with TimescaleDB extension
- **Redis** - In-memory cache and queue backend

### Services Running on Render:
- **Dashboard** - Next.js web application (deployed separately)

## Prerequisites

### EC2 Instance Requirements
- **Recommended**: t2.medium or t3.medium (2 vCPUs, 4 GB RAM)
- **Minimum**: t2.small (1 vCPU, 2 GB RAM) - may be slow during builds
- **Storage**: At least 20 GB
- **OS**: Amazon Linux 2 or Ubuntu 20.04+

### Software Requirements
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

## Deployment Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd best-lap
```

### 2. Create Environment File
```bash
cp .env .env.production
nano .env.production
```

Required environment variables:
```bash
# Database
DB_HOST=timescaledb
DB_PORT=5432
DB_USER=best_lap
DB_PASSWORD=best_lap
DB_NAME=best_lap_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API
API_PORT=3333
CORS_ORIGIN=*
FORCE_HTTP_SWAGGER=false

# Google API
GOOGLE_API_KEY=your_google_api_key_here

# Admin
ADMIN_TOKEN=your_secure_token_here
BULL_BOARD_PORT=4000
BULL_BOARD_URL=http://localhost:4000

# Metrics Collection
COLLECT_METRICS_CRON_EXPRESSION=0 8,14,20 * * *
WORKER_CONCURRENCY=10
SEED_THEMES_URL=https://your-seed-url.com
```

### 3. Deploy Services
```bash
# First deployment (builds images)
./scripts/deploy-ec2.sh

# Subsequent deployments (uses cache for faster builds)
./scripts/deploy-ec2.sh

# Force rebuild without cache (if needed)
./scripts/deploy-ec2.sh --rebuild
```

## Optimizations Explained

### 1. Multi-Stage Docker Builds
Each Dockerfile uses 3-4 stages:
- **Stage 1 (deps)**: Installs dependencies - heavily cached
- **Stage 2 (builder)**: Builds application code
- **Stage 3 (runner)**: Minimal production runtime

Benefits:
- Smaller final images (60-70% reduction)
- Faster rebuilds (dependencies cached)
- Better layer caching

### 2. Sequential Builds
The deploy script builds services one at a time instead of in parallel:
- Prevents memory exhaustion on small instances
- Allows Docker to cache layers effectively
- More predictable resource usage

### 3. Resource Limits
Each container has CPU and memory limits:
- **API**: Max 1 CPU, 512 MB RAM
- **Admin**: Max 0.5 CPU, 256 MB RAM
- **Metrics Collector**: Max 1.5 CPU, 1 GB RAM
- **TimescaleDB**: Max 1 CPU, 512 MB RAM
- **Redis**: Max 0.5 CPU, 256 MB RAM

### 4. .dockerignore
Excludes unnecessary files from build context:
- 50-70% smaller build context
- Faster uploads to Docker daemon
- Excludes web app (deployed on Render)

## Monitoring

### View Logs
```bash
# All services
docker-compose -f docker-compose.ec2.yml logs -f

# Specific service
docker-compose -f docker-compose.ec2.yml logs -f api
docker-compose -f docker-compose.ec2.yml logs -f metrics-collector
docker-compose -f docker-compose.ec2.yml logs -f admin
```

### Monitor Resources
```bash
# Real-time container stats
docker stats

# System memory
free -h

# Disk usage
df -h

# Docker disk usage
docker system df
```

### Health Checks
```bash
# API health
curl http://localhost:3333/health

# Admin panel health
curl http://localhost:4000/health

# Check all containers
docker-compose -f docker-compose.ec2.yml ps
```

## Maintenance

### Restart Services
```bash
# Restart specific service
docker-compose -f docker-compose.ec2.yml restart api

# Restart all services
docker-compose -f docker-compose.ec2.yml restart
```

### Update Code
```bash
# Pull latest changes
git pull

# Rebuild and redeploy
./scripts/deploy-ec2.sh
```

### Clean Up
```bash
# Remove stopped containers and unused images
docker system prune -f

# Remove all unused data (careful!)
docker system prune -af --volumes
```

## Troubleshooting

### Instance Freezes During Build
**Symptoms**: SSH connection lost, instance becomes unresponsive

**Solutions**:
1. Use a larger instance type (t2.medium recommended)
2. Add swap space:
   ```bash
   sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
3. Build images locally and push to registry

### Out of Disk Space
**Symptoms**: Build fails with "no space left on device"

**Solutions**:
```bash
# Clean Docker resources
docker system prune -af --volumes

# Check disk usage
df -h
docker system df

# Remove old logs
sudo journalctl --vacuum-time=3d
```

### Service Won't Start
**Symptoms**: Container keeps restarting

**Solutions**:
```bash
# Check logs
docker-compose -f docker-compose.ec2.yml logs [service-name]

# Check container status
docker-compose -f docker-compose.ec2.yml ps

# Verify environment variables
docker-compose -f docker-compose.ec2.yml config
```

### Slow Performance
**Symptoms**: High CPU or memory usage

**Solutions**:
1. Reduce worker concurrency:
   ```bash
   # In .env.production
   WORKER_CONCURRENCY=5
   ```
2. Check container resource usage:
   ```bash
   docker stats
   ```
3. Consider upgrading instance type

## Security Recommendations

1. **Use Security Groups**: Restrict access to ports 3333, 4000, 5432, 6379
2. **Use Strong Passwords**: Change default DB and Redis passwords
3. **Enable HTTPS**: Use nginx or ALB with SSL certificates
4. **Regular Updates**: Keep Docker and base images updated
5. **Backup Database**: Regular backups of TimescaleDB data

## Cost Optimization

1. **Use Reserved Instances**: Save 30-70% for long-term deployments
2. **Right-size Instance**: Start small, scale up if needed
3. **Use Spot Instances**: For non-critical environments
4. **Monitor Usage**: Use CloudWatch to track resource utilization

## Performance Tips

1. **Enable BuildKit**: Faster Docker builds
   ```bash
   export DOCKER_BUILDKIT=1
   ```
2. **Use Build Cache**: Keep previous builds to speed up deployments
3. **Optimize Cron Schedule**: Adjust metrics collection frequency
4. **Monitor Queues**: Use Bull Board to track job performance
