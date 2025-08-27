#!/bin/bash

echo "🧹 Cleaning up Docker resources..."

# Stop and remove containers
echo "Stopping containers..."
docker compose -f docker-compose.prod.yml down

# Remove unused containers
echo "Removing unused containers..."
docker container prune -f

# Remove unused images
echo "Removing unused images..."
docker image prune -a -f

# Remove unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "Removing unused networks..."
docker network prune -f

# Clean up build cache
echo "Cleaning build cache..."
docker builder prune -a -f

# Show disk usage
echo "📊 Current disk usage:"
df -h

echo "✅ Cleanup completed!"
