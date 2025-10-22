#!/bin/bash

# Light Deploy Script for t2.micro EC2 instances
# This script is optimized for low-memory environments (1GB RAM)
# It does NOT rebuild images - use pre-built images instead

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Light Deploy for t2.micro - Starting..."
echo ""

# Check available memory
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%s", $7}')
print_status "💾 Available memory: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 300 ]; then
    print_error "Low memory detected! Only ${AVAILABLE_MEM}MB available."
    print_warning "Consider cleaning up before deploy:"
    print_warning "  ./scripts/docker-cleanup.sh"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    exit 1
fi

# Stop existing containers
print_status "🛑 Stopping existing containers..."
docker-compose down --remove-orphans || true

# Check if images exist
print_status "🔍 Checking for existing images..."
IMAGES_EXIST=true

if ! docker images | grep -q "best-lap-api"; then
    print_warning "API image not found - will need to build"
    IMAGES_EXIST=false
fi

if ! docker images | grep -q "best-lap-admin"; then
    print_warning "Admin image not found - will need to build"
    IMAGES_EXIST=false
fi

if ! docker images | grep -q "best-lap-metrics-collector"; then
    print_warning "Metrics Collector image not found - will need to build"
    IMAGES_EXIST=false
fi

# If images don't exist, offer to build with cache
if [ "$IMAGES_EXIST" = false ]; then
    print_error "Some images are missing!"
    echo ""
    print_warning "Options:"
    print_warning "  1. Build images WITH cache (slower, ~10-20min on t2.micro)"
    print_warning "  2. Cancel and build locally, then push to EC2"
    echo ""
    read -p "Build now? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Building images with cache..."
        docker-compose build api admin metrics-collector
    else
        print_error "Deploy cancelled. Please build images first."
        exit 1
    fi
fi

# Start infrastructure services first
print_status "🗄️  Starting infrastructure services..."
docker-compose up -d timescaledb redis

# Wait for database to be ready
print_status "⏳ Waiting for database to be ready..."
RETRIES=0
MAX_RETRIES=30
until docker-compose exec -T timescaledb pg_isready -U best_lap -d best_lap_db 2>/dev/null; do
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
        print_error "Database failed to start after ${MAX_RETRIES} attempts"
        exit 1
    fi
    sleep 2
done
print_success "Database is ready!"

# Wait for Redis to be ready
print_status "⏳ Waiting for Redis to be ready..."
RETRIES=0
until docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
        print_error "Redis failed to start after ${MAX_RETRIES} attempts"
        exit 1
    fi
    sleep 2
done
print_success "Redis is ready!"

# Start application services (backend only, no web)
print_status "🚀 Starting application services..."
docker-compose up -d api admin metrics-collector

# Wait for services to start
print_status "⏳ Waiting for services to start..."
sleep 15

# Check service health
print_status "🔍 Checking service health..."

# Check API
if curl -f -s http://localhost:3333/health > /dev/null 2>&1; then
    print_success "✓ API is healthy"
else
    print_warning "✗ API health check failed - check logs: docker-compose logs api"
fi

# Check Admin
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    print_success "✓ Admin panel is healthy"
else
    print_warning "✗ Admin health check failed - check logs: docker-compose logs admin"
fi

# Show running containers
echo ""
print_status "📋 Running containers:"
docker-compose ps

echo ""
print_success "🎉 Light deployment completed!"
echo ""

# Show memory usage
USED_MEM=$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2}')
print_status "💾 Memory usage: ${USED_MEM}%"
echo ""

print_status "🌐 Access your applications:"
print_status "  • API: http://localhost:3333"
print_status "  • API Docs: http://localhost:3333/docs"
print_status "  • Admin Panel: http://localhost:4000"
echo ""
print_status "📊 Useful commands:"
print_status "  • View logs: docker-compose logs -f [service-name]"
print_status "  • Restart service: docker-compose restart [service-name]"
print_status "  • Stop all: docker-compose down"
