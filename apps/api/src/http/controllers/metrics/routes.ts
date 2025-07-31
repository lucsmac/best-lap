import { FastifyInstance } from "fastify"
import { listAverageChannelsMetricsByTheme } from "./list-by-theme"
import { listAverageForAllChannelsMetrics } from "./list-for-all"
import { listChannelMetricsDocs } from "./docs/list.docs"
import { listChannelMetrics } from "./list"
import { listAverageChannelMetrics } from "./list-average"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { listAverageChannelMetricsDocs } from "./docs/list-average.docs"

export async function metricsRoutes(server: FastifyInstance) {
  server.get('/average/:period', listAverageForAllChannelsMetrics)
  server.get('/theme/:theme/average/:period', listAverageChannelsMetricsByTheme)

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
