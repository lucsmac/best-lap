import { z } from 'zod';

export const triggerCollectionParamsSchema = z.object({
  channel_id: z.string().uuid(),
});

export const triggerCollectionPageParamsSchema = z.object({
  channel_id: z.string().uuid(),
  page_id: z.string().uuid(),
});

export const triggerCollectionResponseSchema = z.object({
  message: z.string(),
  jobs_count: z.number(),
  channel_id: z.string().uuid().optional(),
  page_id: z.string().uuid().optional(),
});
