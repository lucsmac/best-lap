#!/bin/bash

# Deploy script for Best Lap applications
# This script handles production deployment with Docker Compose
#
# Usage:
#   ./scripts/deploy.sh              # Deploy backend only (default)
#   ./scripts/deploy.sh --with-web   # Deploy backend + web dashboard

set -e

# Parse arguments
DEPLOY_WEB=false
for arg in "$@"; do
    case $arg in
        --with-web)
            DEPLOY_WEB=true
            shift
            ;;
        *)
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_warning "Please copy .env.production from .env and update with production values"
    exit 1
fi

print_status "🚀 Starting Best Lap deployment process..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
print_status "🛑 Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove old images (optional - uncomment if you want to force rebuild)
# print_status "🗑️  Removing old images..."
# docker rmi best-lap-api:latest best-lap-admin:latest best-lap-metrics-collector:latest || true

# Build new images
print_status "🔨 Building Docker images..."
docker-compose build --no-cache

# Start infrastructure services first
print_status "🗄️  Starting infrastructure services..."
docker-compose up -d timescaledb redis

# Wait for database to be ready
print_status "⏳ Waiting for database to be ready..."
until docker-compose exec -T timescaledb pg_isready -U best_lap -d best_lap_db; do
    print_status "Waiting for PostgreSQL..."
    sleep 2
done

# Wait for Redis to be ready
print_status "⏳ Waiting for Redis to be ready..."
until docker-compose exec -T redis redis-cli ping; do
    print_status "Waiting for Redis..."
    sleep 2
done

# Run database migrations/seeding if needed
print_status "🗃️  Running database setup..."
# Uncomment the next line if you have a seed script
# docker-compose run --rm api pnpm --filter=@best-lap/infra db:seed

# Start application services
print_status "🚀 Starting application services..."
if [ "$DEPLOY_WEB" = true ]; then
    print_status "Deploying backend + web dashboard..."
    docker-compose up -d api admin web metrics-collector
else
    print_status "Deploying backend only (web dashboard excluded)..."
    docker-compose up -d api admin metrics-collector
fi

# Wait a bit for services to start
sleep 10

# Check health of services
print_status "🔍 Checking service health..."

# Check API health
if curl -f http://localhost:3333/health > /dev/null 2>&1; then
    print_success "API is healthy"
else
    print_warning "API health check failed - check logs with: docker-compose logs api"
fi

# Check Admin health
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_success "Admin panel is healthy"
else
    print_warning "Admin panel health check failed - check logs with: docker-compose logs admin"
fi

# Check Web Dashboard health (only if deployed)
if [ "$DEPLOY_WEB" = true ]; then
    if curl -f http://localhost:5173/health > /dev/null 2>&1; then
        print_success "Web Dashboard is healthy"
    else
        print_warning "Web Dashboard health check failed - check logs with: docker-compose logs web"
    fi
fi

# Show running containers
print_status "📋 Running containers:"
docker-compose ps

print_success "🎉 Deployment completed!"
print_status ""
print_status "🌐 Access your applications:"
print_status "  • API: http://localhost:3333"
print_status "  • API Docs: http://localhost:3333/docs"
print_status "  • Admin Panel: http://localhost:4000"
if [ "$DEPLOY_WEB" = true ]; then
    print_status "  • Web Dashboard: http://localhost:5173"
fi
print_status ""
print_status "📊 Useful commands:"
print_status "  • View logs: docker-compose logs -f [service-name]"
print_status "  • Restart service: docker-compose restart [service-name]"
print_status "  • Stop all: docker-compose down"
print_status "  • View status: docker-compose ps"