#!/bin/bash

# Docker Cleanup Script
# This script removes unused Docker resources to free up disk space
# It preserves running containers and their data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🧹 Starting Docker cleanup..."
echo ""

# Show disk usage before cleanup
print_status "📊 Docker disk usage BEFORE cleanup:"
docker system df
echo ""

# Ask for confirmation if running in interactive mode
if [ -t 0 ]; then
    read -p "This will remove all unused Docker resources. Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cleanup cancelled."
        exit 0
    fi
fi

# Remove all stopped containers
print_status "Removing stopped containers..."
docker container prune -f

# Remove dangling images (untagged)
print_status "Removing dangling images..."
docker image prune -f

# Remove unused images (not associated with any container)
print_warning "Removing ALL unused images (this will require rebuilding)..."
docker image prune -a -f

# Remove unused volumes (CAREFUL: this removes data!)
print_warning "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
print_status "Removing unused networks..."
docker network prune -f

# Remove build cache
print_status "Removing build cache..."
docker builder prune -a -f

echo ""
print_success "✅ Docker cleanup completed!"
echo ""

# Show disk usage after cleanup
print_status "📊 Docker disk usage AFTER cleanup:"
docker system df
echo ""

print_status "💡 To free up even more space, you can:"
print_status "  • Remove old log files: sudo journalctl --vacuum-time=3d"
print_status "  • Clear apt cache: sudo apt-get clean"
print_status "  • Check disk usage: df -h"