#!/bin/bash

# Best Lap - Update Script for Production
# Use this script to update your application in production

set -e

echo "🔄 Best Lap - Starting Update Process..."

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found. Are you in the right directory?"
    exit 1
fi

# Backup current .env if it exists
if [ -f ".env" ]; then
    echo "💾 Backing up current .env..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git fetch origin
git pull origin main

# Show what changed
echo "📋 Recent changes:"
git log --oneline -5

# Create database backup before update
echo "💾 Creating database backup..."
mkdir -p backups
BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"

docker run --rm \
  --network best-lap-network \
  -v $(pwd)/backups:/backup \
  -e PGPASSWORD=best_lap \
  postgres:15-alpine \
  pg_dump -h best-lap-postgres -U best_lap best_lap_db > $BACKUP_FILE

echo "✅ Database backup created: $BACKUP_FILE"

# Stop current application
echo "🛑 Stopping current application..."
docker compose -f docker-compose.prod.yml down

# Clean up old images (optional - uncomment if you want to force rebuild)
echo "🧹 Cleaning up old Docker images..."
docker system prune -f

# Rebuild and start application
echo "🏗️  Building and starting updated application..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be healthy..."
sleep 20

# Health checks
echo "🔍 Performing health checks..."

# Check API
if curl -f -s http://localhost:3333/docs > /dev/null; then
    echo "✅ API is healthy (http://localhost:3333)"
else
    echo "❌ API health check failed"
    echo "📋 API logs:"
    docker compose -f docker-compose.prod.yml logs --tail=20 api
    exit 1
fi

# Check Bull Board
if curl -f -s http://localhost:4000 > /dev/null; then
    echo "✅ Bull Board is healthy (http://localhost:4000)"
else
    echo "⚠️  Bull Board might be starting up, checking logs..."
    docker compose -f docker-compose.prod.yml logs --tail=10 bull-board
fi

# Show final status
echo ""
echo "📊 Final service status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Update completed successfully!"
echo ""
echo "🌐 Services available at:"
echo "   • API: http://$(curl -s ifconfig.me):3333"
echo "   • API Docs: http://$(curl -s ifconfig.me):3333/docs"
echo "   • Bull Board: http://$(curl -s ifconfig.me):4000"
echo ""
echo "📊 Monitor logs with:"
echo "   docker compose -f docker-compose.prod.yml logs -f"