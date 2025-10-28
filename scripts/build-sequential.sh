#!/bin/bash

# Sequential Build Script for Low-Memory EC2 Instances
# Builds Docker images one at a time to avoid memory exhaustion
#
# Usage:
#   ./scripts/build-sequential.sh              # Build all services
#   ./scripts/build-sequential.sh --no-cache   # Force rebuild without cache

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
NO_CACHE=""
if [[ "$1" == "--no-cache" ]]; then
    NO_CACHE="--no-cache"
    print_warning "Building without cache"
fi

print_status "🔨 Starting sequential build for EC2..."
echo ""

# Show current resources
print_status "📊 Current system resources:"
free -h | grep -E "Mem:|Swap:"
df -h / | tail -1
echo ""

# Services to build (order matters - smallest first)
SERVICES=("admin" "api" "metrics-collector")

for SERVICE in "${SERVICES[@]}"; do
    print_status "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_status "Building: $SERVICE"
    print_status "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Build the service
    if docker-compose -f docker-compose.ec2.yml build $NO_CACHE $SERVICE; then
        print_success "✅ $SERVICE built successfully"
    else
        print_error "❌ Failed to build $SERVICE"
        exit 1
    fi

    echo ""
    print_status "📊 Memory after building $SERVICE:"
    free -h | grep Mem:
    echo ""

    # Small pause to let system stabilize
    sleep 2
done

print_status "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "🎉 All services built successfully!"
print_status "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show final state
print_status "📋 Built images:"
docker images | grep best-lap
echo ""

print_status "💡 Next steps:"
echo "  1. Start infrastructure: docker-compose -f docker-compose.ec2.yml up -d timescaledb redis"
echo "  2. Wait 10 seconds: sleep 10"
echo "  3. Start applications: docker-compose -f docker-compose.ec2.yml up -d api admin metrics-collector"
echo ""
echo "  OR use the deploy script: ./scripts/deploy-ec2.sh"
