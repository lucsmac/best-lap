#!/bin/bash
# Script to fix Redis issue and deploy on EC2

echo "========================================="
echo "EC2 Redis Fix and Deployment Script"
echo "========================================="
echo ""

# Parse command line arguments
USE_SIMPLE=false
CLEAN_REDIS_DATA=false

for arg in "$@"; do
  case $arg in
    --simple|-s)
      USE_SIMPLE=true
      ;;
    --clean-redis|-c)
      CLEAN_REDIS_DATA=true
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: $0 [--simple|-s] [--clean-redis|-c]"
      echo "  --simple/-s: Use simplified config without resource limits"
      echo "  --clean-redis/-c: Delete old Redis data (fixes large RDB issues)"
      exit 1
      ;;
  esac
done

if [ "$USE_SIMPLE" = true ]; then
  COMPOSE_FILE="docker-compose.ec2-simple.yml"
  echo "Using simplified config (no resource limits)"
else
  COMPOSE_FILE="docker-compose.ec2.yml"
  echo "Using standard config (with resource limits)"
fi
echo "Compose file: $COMPOSE_FILE"

if [ "$CLEAN_REDIS_DATA" = true ]; then
  echo "⚠ Will clean Redis data (old RDB will be deleted)"
fi
echo ""

# Step 1: Stop all running containers
echo "[1/6] Stopping all containers..."
docker-compose -f docker-compose.ec2.yml down 2>/dev/null || true
docker-compose -f docker-compose.ec2-simple.yml down 2>/dev/null || true
echo "✓ Containers stopped"
echo ""

# Step 2: Remove old containers (including redis-autodromo)
echo "[2/6] Removing old containers..."
docker rm -f redis-autodromo 2>/dev/null || echo "  (redis-autodromo already removed)"
docker rm -f elasticsearch-dev 2>/dev/null || echo "  (elasticsearch-dev already removed)"
docker rm -f autodromo_eleanor-postgres-autodromo-1 2>/dev/null || echo "  (postgres already removed)"
docker rm -f team-report-frontend-dev 2>/dev/null || echo "  (frontend already removed)"
docker rm -f team-report-backend-dev 2>/dev/null || echo "  (backend already removed)"
docker rm -f team-report-db-dev 2>/dev/null || echo "  (db already removed)"
echo "✓ Old containers removed"
echo ""

# Step 3: Prune unused containers and networks
echo "[3/6] Cleaning up Docker resources..."
docker container prune -f
docker network prune -f

# Clean Redis data if requested
if [ "$CLEAN_REDIS_DATA" = true ]; then
  echo "Removing Redis volume to clear old data..."
  docker volume rm best-lap_redis_data 2>/dev/null || echo "  (Redis volume already removed or doesn't exist)"
  docker volume rm redis_data 2>/dev/null || echo "  (Alternative Redis volume name not found)"
  echo "✓ Redis data cleaned"
fi

echo "✓ Docker resources cleaned"
echo ""

# Step 4: Start infrastructure services first
echo "[4/6] Starting infrastructure (TimescaleDB + Redis)..."
docker-compose -f "$COMPOSE_FILE" up -d timescaledb redis
echo "✓ Infrastructure services starting..."
echo ""

# Step 5: Wait for health checks
echo "[5/6] Waiting for health checks (60s)..."
sleep 10
for i in {1..10}; do
  echo -n "  Checking health... ($i/10) "

  # Check TimescaleDB
  POSTGRES_STATUS=$(docker inspect --format='{{.State.Health.Status}}' timescaledb 2>/dev/null || echo "not_found")

  # Check Redis
  REDIS_STATUS=$(docker inspect --format='{{.State.Health.Status}}' redis 2>/dev/null || echo "not_found")

  echo "TimescaleDB: $POSTGRES_STATUS, Redis: $REDIS_STATUS"

  if [ "$POSTGRES_STATUS" == "healthy" ] && [ "$REDIS_STATUS" == "healthy" ]; then
    echo "✓ Both services are healthy!"
    break
  fi

  if [ $i -eq 10 ]; then
    echo "⚠ Warning: Services not healthy after 60s, checking logs..."
    echo ""
    echo "TimescaleDB logs:"
    docker logs timescaledb --tail 20
    echo ""
    echo "Redis logs:"
    docker logs redis --tail 20
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi

  sleep 5
done
echo ""

# Step 6: Start application services
echo "[6/6] Starting application services..."
docker-compose -f "$COMPOSE_FILE" up -d api admin metrics-collector
echo "✓ Application services starting..."
echo ""

# Final status check
echo "========================================="
echo "Deployment Status"
echo "========================================="
docker-compose -f "$COMPOSE_FILE" ps
echo ""

echo "========================================="
echo "Quick Health Check"
echo "========================================="
echo "Checking container health..."
echo ""

for container in timescaledb redis best-lap-api best-lap-admin best-lap-metrics-collector; do
  if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
    STATUS=$(docker inspect --format='{{.State.Status}}' $container)
    HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no healthcheck{{end}}' $container)
    echo "✓ $container: $STATUS ($HEALTH)"
  else
    echo "✗ $container: not running"
  fi
done
echo ""

echo "========================================="
echo "Next Steps"
echo "========================================="
echo "1. Check logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "2. Check specific service: docker logs <container_name> -f"
echo "3. Check API health: curl http://localhost:3333/health"
echo "4. Access Admin: http://<your-ec2-ip>:4000"
echo ""
echo "Configuration used: $COMPOSE_FILE"
if [ "$CLEAN_REDIS_DATA" = true ]; then
  echo "NOTE: Redis data was cleared. Old queues/data are gone."
fi
if [ "$USE_SIMPLE" = true ]; then
  echo "NOTE: Using simplified config without resource limits."
  echo "      This may use more resources but should be more stable."
else
  echo ""
  echo "Troubleshooting options if issues persist:"
  echo "  1. Use simplified config:  ./ec2-fix-redis.sh --simple"
  echo "  2. Clean Redis data:       ./ec2-fix-redis.sh --clean-redis"
  echo "  3. Both:                   ./ec2-fix-redis.sh --simple --clean-redis"
  echo "  4. Configure system:       sudo ./configure-ec2-for-redis.sh"
fi
echo ""
