import { FastifyInstance } from "fastify"
import { channelsRoutes } from "./controllers/channels/routes"
import { metricsRoutes } from "./controllers/metrics/routes"
import { pagesRoutes } from "./controllers/pages/routes"

export async function appRoutes(server: FastifyInstance) {
  server.register(channelsRoutes, {
    prefix: 'channels',
  })
  server.register(pagesRoutes, {
    prefix: 'channels/pages',
  })
  server.register(metricsRoutes, {
    prefix: 'metrics',
  })
}