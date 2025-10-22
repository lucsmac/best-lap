#!/bin/bash

# Build script for Best Lap monorepo
# This script builds Docker images for all applications
#
# Usage:
#   ./scripts/build.sh              # Build backend only (default)
#   ./scripts/build.sh --with-web   # Build backend + web dashboard

set -e

# Parse arguments
BUILD_WEB=false
for arg in "$@"; do
    case $arg in
        --with-web)
            BUILD_WEB=true
            shift
            ;;
        *)
            ;;
    esac
done

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

if [ "$BUILD_WEB" = true ]; then
    echo "Building Web Dashboard application..."
    docker build -t best-lap-web:latest -f apps/web/Dockerfile \
      --build-arg VITE_API_URL="${VITE_API_URL}" .
else
    echo "⏭️  Skipping Web Dashboard build (use --with-web to include)"
fi

echo "✅ All Docker images built successfully!"

# Show built images
echo "📦 Built images:"
docker images | grep best-lap

echo "🎉 Build process completed!"
echo ""
echo "Next steps:"
echo "1. Run 'docker-compose up -d' to start all services"
echo "2. Or run './scripts/deploy.sh' for production deployment"