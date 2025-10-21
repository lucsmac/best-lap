import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/dashboard'
import { ChannelsPage } from '@/pages/channels'
import { ChannelDetailsPage } from '@/pages/channel-details'
import { MetricsPage } from '@/pages/metrics'
import { ComparePage } from '@/pages/compare'

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
})

// Dashboard route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

// Channels routes
const channelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/channels',
  component: ChannelsPage,
})

const channelDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/channels/$channelId',
  component: ChannelDetailsPage,
})

// Metrics route
const metricsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/metrics',
  component: MetricsPage,
})

// Compare route
const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compare',
  component: ComparePage,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  channelsRoute,
  channelDetailsRoute,
  metricsRoute,
  compareRoute,
])

// Create router
export const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
