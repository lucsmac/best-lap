#!/bin/bash

# EC2 Optimized Deploy Script for Best Lap
# This script is optimized for low-resource EC2 instances
#
# Features:
# - Sequential builds to avoid memory overload
# - Build caching for faster deployments
# - Resource monitoring
# - No dashboard (runs on Render)
#
# Usage:
#   ./scripts/deploy-ec2.sh              # Deploy all backend services
#   ./scripts/deploy-ec2.sh --rebuild    # Force rebuild without cache

set -e

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

# Check for rebuild flag
REBUILD_FLAG=""
if [[ "$1" == "--rebuild" ]]; then
    REBUILD_FLAG="--no-cache"
    print_warning "Rebuild mode: Building without cache"
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production with production values"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

print_status "🚀 Starting EC2 optimized deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Show current system resources
print_status "📊 Current system resources:"
free -h
df -h / | tail -1

# Stop existing containers gracefully
print_status "🛑 Stopping existing containers..."
docker-compose -f docker-compose.ec2.yml down || true

# Clean up to free space (optional - uncomment if needed)
# print_status "🧹 Cleaning up Docker resources..."
# docker system prune -f --volumes

# Start infrastructure services first (no build needed - they use official images)
print_status "🗄️  Starting infrastructure services..."
docker-compose -f docker-compose.ec2.yml up -d timescaledb redis

# Wait for database to be ready
print_status "⏳ Waiting for database to be ready..."
RETRIES=30
until docker-compose -f docker-compose.ec2.yml exec -T timescaledb pg_isready -U best_lap -d best_lap_db > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -eq 0 ]; then
        print_error "Database failed to start"
        docker-compose -f docker-compose.ec2.yml logs timescaledb
        exit 1
    fi
    sleep 2
done
print_success "Database is ready"

# Wait for Redis to be ready
print_status "⏳ Waiting for Redis to be ready..."
RETRIES=30
until docker-compose -f docker-compose.ec2.yml exec -T redis redis-cli ping > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -eq 0 ]; then
        print_error "Redis failed to start"
        docker-compose -f docker-compose.ec2.yml logs redis
        exit 1
    fi
    sleep 2
done
print_success "Redis is ready"

# Build and start services SEQUENTIALLY to avoid memory issues
print_status "🔨 Building and deploying services sequentially..."

# 1. Build and start API
print_status "Building API service..."
docker-compose -f docker-compose.ec2.yml build $REBUILD_FLAG api
print_status "Starting API service..."
docker-compose -f docker-compose.ec2.yml up -d api

# Wait a bit for API to stabilize
sleep 5

# 2. Build and start Admin
print_status "Building Admin service..."
docker-compose -f docker-compose.ec2.yml build $REBUILD_FLAG admin
print_status "Starting Admin service..."
docker-compose -f docker-compose.ec2.yml up -d admin

# Wait a bit for Admin to stabilize
sleep 5

# 3. Build and start Metrics Collector
print_status "Building Metrics Collector service..."
docker-compose -f docker-compose.ec2.yml build $REBUILD_FLAG metrics-collector
print_status "Starting Metrics Collector service..."
docker-compose -f docker-compose.ec2.yml up -d metrics-collector

# Wait for all services to fully start
print_status "⏳ Waiting for services to start..."
sleep 15

# Check health of services
print_status "🔍 Checking service health..."

# Check API health
RETRIES=10
until curl -f http://localhost:3333/health > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -eq 0 ]; then
        print_warning "API health check failed - checking logs..."
        docker-compose -f docker-compose.ec2.yml logs --tail=50 api
        break
    fi
    sleep 3
done

if curl -f http://localhost:3333/health > /dev/null 2>&1; then
    print_success "API is healthy"
else
    print_warning "API may not be fully ready - check logs with: docker-compose -f docker-compose.ec2.yml logs api"
fi

# Check Admin health
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_success "Admin panel is healthy"
else
    print_warning "Admin panel health check failed - check logs with: docker-compose -f docker-compose.ec2.yml logs admin"
fi

# Show running containers
print_status "📋 Running containers:"
docker-compose -f docker-compose.ec2.yml ps

# Show resource usage
print_status "📊 Docker resource usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

print_success "🎉 EC2 deployment completed!"
print_status ""
print_status "🌐 Services running on EC2:"
print_status "  • API: http://localhost:3333"
print_status "  • API Docs: http://localhost:3333/docs"
print_status "  • Admin Panel (BullBoard): http://localhost:4000"
print_status "  • Dashboard: Running on Render (separate)"
print_status ""
print_status "📊 Useful commands:"
print_status "  • View logs: docker-compose -f docker-compose.ec2.yml logs -f [service-name]"
print_status "  • Restart service: docker-compose -f docker-compose.ec2.yml restart [service-name]"
print_status "  • Stop all: docker-compose -f docker-compose.ec2.yml down"
print_status "  • View status: docker-compose -f docker-compose.ec2.yml ps"
print_status "  • Monitor resources: docker stats"
print_status ""
print_status "💡 Tips for EC2:"
print_status "  • Monitor memory: free -h"
print_status "  • Monitor disk: df -h"
print_status "  • Clean up: docker system prune -f"
