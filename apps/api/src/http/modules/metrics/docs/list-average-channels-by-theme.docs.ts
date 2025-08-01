import { z } from 'zod';
import { MetricEnum } from '../utils/metrics-schemas';
import { dateSchema } from './utils/date-schema';

export const listAverageChannelsMetricsByThemeDocs = {
  schema: {
    description: 'Get average metrics for channels by theme and period',
    tags: ['metrics'],
    params: z.object({
      theme: z.string().describe('Must be a valid theme'),
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
          channel_id: z.uuid(),
          channel_url: z.string(),
          theme: z.string(),
          period_start: z.iso.datetime(),
          avg_score: z.number().optional(),
          avg_response_time: z.number().optional(),
          avg_fcp: z.number().optional(),
          avg_si: z.number().optional(),
          avg_lcp: z.number().optional(),
          avg_tbt: z.number().optional(),
          avg_cls: z.number().optional(),
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
};
