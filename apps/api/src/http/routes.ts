import { FastifyInstance } from "fastify"
import {
  channelsRoutes,
  pagesRoutes,
  metricsRoutes,
} from "./modules"

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