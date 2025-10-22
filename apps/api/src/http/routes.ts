import { FastifyInstance } from "fastify"
import { channelsRoutes } from "./modules/channels/routes"
import { metricsRoutes } from "./modules/metrics/routes"
import { pagesRoutes } from "./modules/pages/routes"
import { providersRoutes } from "./modules/providers/routes"

export async function appRoutes(server: FastifyInstance) {
  server.register(channelsRoutes, {
    prefix: 'channels',
  })

  server.register(pagesRoutes, {
    prefix: 'channels',
  })

  server.register(metricsRoutes, {
    prefix: 'channels/metrics',
  })

  server.register(providersRoutes, {
    prefix: 'providers',
  })
}