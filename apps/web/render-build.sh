#!/bin/bash

# Render Build Script for Monorepo
# This script handles building the web app in a monorepo context

set -e

echo "🚀 Starting Render build for best-lap web dashboard..."
echo ""

# Get the absolute path to monorepo root
MONOREPO_ROOT="$(cd ../.. && pwd)"
echo "📁 Monorepo root: $MONOREPO_ROOT"

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
