#!/bin/bash

# Render Build Script for Monorepo
# This script handles building the web app in a monorepo context

set -e

echo "🚀 Starting Render build for best-lap web dashboard..."
echo ""

# Render clones the repo to /opt/render/project/src by default
# We need to find the monorepo root which contains package.json and pnpm-workspace.yaml

# Current working directory in Render
echo "📍 Current directory: $(pwd)"

# Find monorepo root by looking for pnpm-workspace.yaml
# This handles both local testing and Render's directory structure
if [ -f "../../pnpm-workspace.yaml" ]; then
    MONOREPO_ROOT="$(cd ../.. && pwd)"
elif [ -f "pnpm-workspace.yaml" ]; then
    MONOREPO_ROOT="$(pwd)"
else
    echo "❌ Error: Cannot find monorepo root (looking for pnpm-workspace.yaml)"
    echo "Searching in current and parent directories..."
    find . ../.. -maxdepth 1 -name "pnpm-workspace.yaml" 2>/dev/null || true
    exit 1
fi

echo "📁 Monorepo root: $MONOREPO_ROOT"

# Verify we found the correct root
if [ ! -f "$MONOREPO_ROOT/package.json" ]; then
    echo "❌ Error: package.json not found in $MONOREPO_ROOT"
    exit 1
fi

echo "✅ Found package.json at monorepo root"

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.14.0
fi

echo "✅ pnpm version: $(pnpm --version)"

# Install dependencies from monorepo root
echo "📦 Installing dependencies from monorepo root..."
cd "$MONOREPO_ROOT"
pnpm install --frozen-lockfile --prod=false

# Debug: Check if turbo binary exists
echo "🔍 Checking turbo installation..."
if [ -f "node_modules/.bin/turbo" ]; then
    echo "✅ Turbo binary found at node_modules/.bin/turbo"
    ls -lh node_modules/.bin/turbo
else
    echo "❌ Turbo binary NOT found"
    echo "Listing node_modules/.bin/:"
    ls -la node_modules/.bin/ | head -20 || true
fi

# Build the web app using npx (handles missing binary gracefully)
echo "🔨 Building web application..."
npx turbo run build --filter=@best-lap/web

echo ""
echo "✅ Build completed successfully!"
echo "📦 Output directory: apps/web/dist"

# Verify build output exists
if [ ! -d "apps/web/dist" ]; then
    echo "❌ Error: Build output directory not found!"
    echo "Expected: apps/web/dist"
    ls -la apps/web/ || true
    exit 1
fi

echo "📁 Build output contents:"
ls -lh apps/web/dist/ || true
