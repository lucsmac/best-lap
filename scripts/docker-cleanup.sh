#!/bin/bash

# Docker Cleanup Script
# This script removes unused Docker resources to free up disk space

echo "🧹 Starting Docker cleanup..."

# Stop all running containers
echo "Stopping all running containers..."
docker stop $(docker ps -q) 2>/dev/null || echo "No running containers to stop"

# Remove all stopped containers
echo "Removing stopped containers..."
docker container prune -f

# Remove all unused images
echo "Removing unused images..."
docker image prune -a -f

# Remove all unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove all unused networks
echo "Removing unused networks..."
docker network prune -f

# Remove build cache
echo "Removing build cache..."
docker builder prune -a -f

# Show disk usage after cleanup
echo "📊 Docker disk usage after cleanup:"
docker system df

echo "✅ Docker cleanup completed!"