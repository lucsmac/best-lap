import { z } from 'zod';
import { MetricEnum } from '../utils/metrics-schemas';
import { dateSchema } from './utils/date-schema';

export const listChannelMetricsDocs = {
  schema: {
    description: 'List all metrics for a channel',
    tags: ['metrics'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID')
    }),
    querystring: z.object({
      metric: MetricEnum.optional().describe('Must be a valid metric'),
      startDate: dateSchema.optional().describe('Date must be in YYYY-MM-DD format'),
      endDate: dateSchema.optional().describe('Date must be in YYYY-MM-DD format')
    }),
    response: {
      200: z.object({
        page_url: z.string(),
        theme: z.string(),
        metrics: z.array(z.object({
          time: z.iso.datetime(),
          score: z.number().optional(),
          response_time: z.number().optional(),
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
}