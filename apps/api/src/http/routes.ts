import { FastifyInstance } from "fastify"
import { channelRoutes } from "./controllers/channel-metrics/routes";
import { channelsRoutes } from "./controllers/channels/routes";
import { metricsRoutes } from "./controllers/metrics/routes";

export async function appRoutes(server: FastifyInstance) {
  
  server.register(channelRoutes, {
    prefix: 'channel',
  })
  server.register(channelsRoutes, {
    prefix: 'channels',
  })
  server.register(metricsRoutes, {
    prefix: 'channels',
  })
}