#!/bin/bash

# Aggressive Memory Cleanup Script for EC2
# Use this before building Docker images on low-memory instances

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo "========================================="
echo "🧹 EC2 Memory Cleanup Script"
echo "========================================="
echo ""

print_status "📊 Memory BEFORE cleanup:"
free -h
echo ""

# 1. Stop all Docker containers
print_status "1️⃣  Stopping all Docker containers..."
docker-compose -f docker-compose.ec2.yml down 2>/dev/null || docker stop $(docker ps -aq) 2>/dev/null || true
print_success "Containers stopped"
echo ""

# 2. Remove unused Docker resources
print_status "2️⃣  Removing unused Docker resources..."
docker system prune -af --volumes
print_success "Docker cleaned"
echo ""

# 3. Clear page cache (requires sudo)
print_status "3️⃣  Clearing system cache..."
if [ "$EUID" -eq 0 ]; then
    sync
    echo 3 > /proc/sys/vm/drop_caches
    print_success "System cache cleared"
else
    print_warning "Run with sudo to clear system cache: sudo ./scripts/free-memory.sh"
fi
echo ""

# 4. Show memory after cleanup
print_status "📊 Memory AFTER cleanup:"
free -h
echo ""

# 5. Show disk space
print_status "💾 Disk space:"
df -h / | tail -1
echo ""

print_success "✅ Cleanup complete!"
echo ""
print_status "💡 Next steps:"
echo "  • Build images: ./scripts/build-sequential.sh"
echo "  • Or deploy: ./scripts/deploy-ec2.sh"
