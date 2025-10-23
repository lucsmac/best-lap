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

# Install dependencies from monorepo root
echo "📦 Installing dependencies from monorepo root..."
cd "$MONOREPO_ROOT"
pnpm install --frozen-lockfile

# Build the web app
echo "🔨 Building web application..."
pnpm build --filter=@best-lap/web

echo ""
echo "✅ Build completed successfully!"
echo "📦 Output directory: apps/web/dist"
