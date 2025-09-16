#!/bin/bash

# Build script for Best Lap monorepo
# This script builds Docker images for all applications

set -e

echo "🚀 Starting build process for Best Lap applications..."

# Load environment variables from .env.production if it exists
if [ -f .env.production ]; then
    echo "📄 Loading production environment variables..."
    set -a # automatically export all variables
    source .env.production
    set +a # stop automatically exporting
fi

# Build all Docker images
echo "🔨 Building Docker images..."

echo "Building API application..."
docker build -t best-lap-api:latest -f apps/api/Dockerfile .

echo "Building Admin application..."
docker build -t best-lap-admin:latest -f apps/admin/Dockerfile .

echo "Building Metrics Collector application..."
docker build -t best-lap-metrics-collector:latest -f apps/metrics-collector/Dockerfile .

echo "✅ All Docker images built successfully!"

# Show built images
echo "📦 Built images:"
docker images | grep best-lap

echo "🎉 Build process completed!"
echo ""
echo "Next steps:"
echo "1. Run 'docker-compose up -d' to start all services"
echo "2. Or run './scripts/deploy.sh' for production deployment"