import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import {
  listAverageForAllChannelsMetrics,
  listAverageChannelsMetricsByTheme,
  listAverageChannelMetrics,
  listChannelMetrics
} from "./controllers"
import {
  listAverageChannelsMetricsByThemeDocs,
  listAverageChannelMetricsDocs,
  listChannelMetricsDocs,
  listAverageForAllChannelsMetricsDocs
} from "./docs"

export async function metricsRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/average/:period',
      listAverageForAllChannelsMetricsDocs,
      listAverageForAllChannelsMetrics
    )

  server
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/theme/:theme/average/:period',
      listAverageChannelsMetricsByThemeDocs,
      listAverageChannelsMetricsByTheme
    )

  server
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/:channel_id',
      listChannelMetricsDocs,
      listChannelMetrics
    )

  server
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/:channel_id/average/:period',
      listAverageChannelMetricsDocs,
      listAverageChannelMetrics
    )
}
