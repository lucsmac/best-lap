import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { listChannelMetrics } from "./list"
import { listAverageChannelMetrics } from "./list-average"
import { MetricEnum } from "./utils/metrics-schemas"

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
  )

export async function channelRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/:channel_id/metrics',
      {
        schema: {
          description: 'List all metrics for a channel',
          tags: ['channel-metrics'],
          params: z.object({
            channel_id: z.string().uuid().describe('Must be a valid channel ID')
          }),
          querystring: z.object({
            metric: MetricEnum.optional().describe('Must be a valid metric'),
            startDate: dateSchema.optional().describe('Date must be in YYYY-MM-DD format'),
            endDate: dateSchema.optional().describe('Date must be in YYYY-MM-DD format')
          }),
          response: {
            200: z.object({
              channel_url: z.string(),
              theme: z.string(),
              metrics: z.array(z.object({
                time: z.string().datetime(),
                score: z.number().optional(),
                responseTime: z.number().optional(),
                fcp: z.number().optional(),
                si: z.number().optional(),
                lcp: z.number().optional(),
                tbt: z.number().optional(),
                cls: z.number().optional()
              }))
            }),
            404: z.object({
              message: z.string()
            }),
            500: z.object({
              error: z.string()
            })
          }
        }
      },
      listChannelMetrics
    )
  server
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/:channel_id/metrics/average/:period',
      {
        schema: {
          description: 'Get average metrics for a channel by period',
          tags: ['channel-metrics'],
          params: z.object({
            channel_id: z.string().uuid().describe('Must be a valid channel ID'),
            period: z.enum(['hourly', 'daily', 'weekly', 'monthly']).describe('Must be a valid period')
          }),
          querystring: z.object({
            metric: MetricEnum.optional().describe('Must be a valid metric'),
            startDate: dateSchema.optional().describe('Date must be in YYYY-MM-DD format'),
            endDate: dateSchema.optional().describe('Date must be in YYYY-MM-DD format')
          }),
          response: {
            200: z.object({
              metrics: z.array(z.object({
                period_start: z.string().datetime(),
                avg_score: z.number().optional(),
                avg_response_time: z.number().optional(),
                avg_fcp: z.number().optional(),
                avg_si: z.number().optional(),
                avg_lcp: z.number().optional(),
                avg_tbt: z.number().optional(),
                avg_cls: z.number().optional()
              }))
            }),
            404: z.object({
              message: z.string()
            }),
            500: z.object({
              error: z.string()
            })
          }
        }
      },
      listAverageChannelMetrics
    )
}
