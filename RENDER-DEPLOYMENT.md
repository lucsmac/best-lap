# Render Deployment Guide - Web Dashboard

## Overview

This guide provides instructions for deploying the Best Lap web dashboard to Render.com as a static site.

## Architecture

The web dashboard is deployed separately from the backend services:

- **Frontend (Render.com)**: Next.js/Vite static site
- **Backend (EC2)**: API, Admin Panel, Metrics Collector, Database, Redis

## Prerequisites

1. **Render Account**: Create account at [render.com](https://render.com)
2. **GitHub Repository**: Repository connected to Render
3. **EC2 Backend**: Backend services running (see `EC2-DEPLOYMENT.md`)

## Deployment Methods

### Method 1: Using Render Blueprint (Recommended)

The repository includes a `render.yaml` blueprint file for easy deployment.

#### Steps:

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com

2. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: `best-lap-dashboard` (or your preferred name)
   - **Root Directory**: `.` (repository root - leave blank or enter a dot)
   - **Build Command**: `bash apps/web/render-build.sh`
   - **Publish Directory**: `apps/web/dist`

4. **Environment Variables**
   Add the following environment variables:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `VITE_API_URL` | `http://your-ec2-instance:3333` | Your EC2 API URL |
   | `NODE_VERSION` | `20` | Node.js version |
   | `PNPM_VERSION` | `8.14.0` | pnpm version |
   | `NODE_ENV` | `production` | Environment mode |

   **IMPORTANT**: Replace `your-ec2-instance` with your actual EC2 public DNS or IP address.

5. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy

### Method 2: Using Render Blueprint File

If you prefer to use the blueprint file directly:

1. **Upload Blueprint**
   - In Render Dashboard, go to "Blueprints"
   - Click "New Blueprint Instance"
   - Select your repository
   - Render will detect `render.yaml` automatically

2. **Configure Environment Variables**
   - Set `VITE_API_URL` to your EC2 API URL
   - Other variables are pre-configured in `render.yaml`

3. **Apply Blueprint**
   - Review settings
   - Click "Apply" to create the service

### Method 3: Manual Configuration

If you prefer manual setup:

1. **Create Static Site**
   - New + → Static Site
   - Connect repository

2. **Build Settings**
   ```
   Root Directory: .
   Build Command: bash apps/web/render-build.sh
   Publish Directory: apps/web/dist
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=http://your-ec2-instance:3333
   NODE_VERSION=20
   PNPM_VERSION=8.14.0
   NODE_ENV=production
   ```

## Configuration

### API URL Configuration

The web dashboard needs to connect to your EC2 backend. Set the `VITE_API_URL` environment variable:

**Examples:**
```bash
# Using EC2 Public DNS
VITE_API_URL=http://ec2-54-123-456-789.compute-1.amazonaws.com:3333

# Using Elastic IP
VITE_API_URL=http://54.123.456.789:3333

# Using custom domain (recommended for production)
VITE_API_URL=https://api.yourdomain.com
```

**Security Notes:**
- For production, use HTTPS with a custom domain
- Configure CORS on your EC2 API to allow requests from your Render domain
- Consider using CloudFront or a similar CDN for better performance

### CORS Configuration (EC2 API)

Update your EC2 `.env.production` file to allow requests from Render:

```bash
# Allow your Render domain
CORS_ORIGIN=https://your-app-name.onrender.com

# Or allow multiple origins (comma-separated)
CORS_ORIGIN=https://your-app-name.onrender.com,https://www.yourdomain.com

# For development/testing only
CORS_ORIGIN=*
```

After updating, redeploy your EC2 services:
```bash
pnpm docker:deploy:ec2
```

## Build Process

The build process is handled by `apps/web/render-build.sh`:

1. **Detect Monorepo Root**: Finds `pnpm-workspace.yaml`
2. **Install Dependencies**: Runs `pnpm install` from monorepo root
3. **Build Application**: Builds only the web app using `pnpm build --filter=@best-lap/web`
4. **Output**: Static files are generated in `apps/web/dist`

## Monitoring

### View Logs

In Render Dashboard:
1. Go to your service
2. Click "Logs" tab
3. View build and deployment logs in real-time

### Build Status

- **Green checkmark**: Deployment successful
- **Yellow circle**: Build in progress
- **Red X**: Build failed

### Common Build Errors

See [Troubleshooting](#troubleshooting) section below.

## Auto-Deploy

Render automatically deploys when you push to your main branch.

### Disable Auto-Deploy

If you want manual deployments:
1. Go to service settings
2. Disable "Auto-Deploy"
3. Manually trigger deploys from dashboard

### Deploy Specific Branches

1. Go to service settings
2. Change "Branch" to your preferred branch
3. Save changes

## Custom Domain

### Add Custom Domain

1. **In Render Dashboard**:
   - Go to your service
   - Click "Settings" → "Custom Domain"
   - Click "Add Custom Domain"

2. **Enter Domain**:
   - Enter your domain (e.g., `dashboard.yourdomain.com`)

3. **Configure DNS**:
   - Add CNAME record in your DNS provider:
     ```
     CNAME dashboard your-app-name.onrender.com
     ```

4. **Wait for Verification**:
   - Render will automatically provision SSL certificate
   - Usually takes 5-15 minutes

5. **Update CORS**:
   - Update `CORS_ORIGIN` on EC2 to include your custom domain

## Performance Optimization

### Caching

The `render.yaml` includes cache headers for static assets:
- Static assets (JS, CSS, images): Cached for 1 year
- HTML: No cache (for SPA routing)

### CDN

Render automatically serves your site through their global CDN for fast delivery worldwide.

### Build Optimization

The build process:
- Uses Vite for fast builds
- Tree-shaking removes unused code
- Code splitting for optimal loading
- Minification for smaller bundle sizes

## Troubleshooting

### Error: "No package.json found in /opt/render"

**Cause**: Build script can't find monorepo root

**Solution**: Ensure Root Directory is set to `.` in Render settings

### Error: "pnpm: command not found"

**Cause**: pnpm not installed during build

**Solution**: The build script now auto-installs pnpm. If still failing, verify `PNPM_VERSION` env var is set.

### Error: "Failed to fetch from API"

**Cause**: API URL incorrect or CORS not configured

**Solutions**:
1. Verify `VITE_API_URL` environment variable
2. Test API URL: `curl http://your-api-url/health`
3. Check CORS settings on EC2
4. Verify EC2 security groups allow inbound traffic on port 3333

### Build Succeeds but Site is Blank

**Cause**: Incorrect publish directory or routing issue

**Solutions**:
1. Verify Publish Directory is `apps/web/dist`
2. Check that SPA rewrite rule is configured (in `render.yaml`)
3. Verify Vite build actually created files in `apps/web/dist`

### Error: "Build exceeded time limit"

**Cause**: Build taking too long (Render has 15-minute limit for free tier)

**Solutions**:
1. Upgrade to paid tier (longer build timeout)
2. Optimize dependencies (remove unused packages)
3. Use build caching (automatically enabled by Render)

### API Requests Failing with CORS Error

**Cause**: CORS not properly configured on backend

**Solutions**:
1. Update `CORS_ORIGIN` in EC2 `.env.production`
2. Restart API: `docker-compose -f docker-compose.ec2.yml restart api`
3. Verify CORS headers in browser DevTools

## Cost

### Free Tier
- **Static Sites**: Free with some limitations
- **Bandwidth**: 100 GB/month free
- **Build Minutes**: 500 minutes/month free

### Paid Tiers
- Start at $7/month for more build minutes and bandwidth
- Custom domains free on all tiers
- See [Render Pricing](https://render.com/pricing) for details

## Security

### HTTPS

- Render automatically provides SSL certificates
- All sites served over HTTPS
- Certificates auto-renew

### Environment Variables

- Never commit sensitive data to repository
- Use Render's environment variable system
- Variables are encrypted at rest

### Headers

Security headers are configured in `render.yaml`:
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: Enable XSS filter

## Best Practices

1. **Use Environment Variables**: Never hardcode API URLs
2. **Enable Auto-Deploy**: Keep dashboard in sync with code
3. **Monitor Logs**: Check build logs for warnings
4. **Test Locally**: Use `pnpm dev` before deploying
5. **Use Custom Domain**: Better for SEO and branding
6. **Configure CORS Properly**: Restrict to your domains only
7. **Monitor Performance**: Use Render metrics and analytics

## Support

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

## Quick Reference

### Important URLs
```bash
# Render Dashboard
https://dashboard.render.com

# Your deployed site (example)
https://your-app-name.onrender.com

# API URL (configure this)
http://your-ec2-instance:3333
```

### Key Commands
```bash
# Local build test
cd apps/web
pnpm build

# Local preview
pnpm preview

# Test API connection
curl http://your-ec2-instance:3333/health
```

### Required Environment Variables
```bash
VITE_API_URL=http://your-ec2-instance:3333
NODE_VERSION=20
PNPM_VERSION=8.14.0
NODE_ENV=production
```
