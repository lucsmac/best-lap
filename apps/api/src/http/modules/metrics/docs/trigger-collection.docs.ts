import { z } from 'zod';
import {
  triggerCollectionParamsSchema,
  triggerCollectionPageParamsSchema,
  triggerCollectionResponseSchema
} from '../utils/trigger-collection-schemas';

export const triggerCollectionAllDocs = {
  schema: {
    description: 'Trigger metrics collection for all active channels',
    tags: ['metrics'],
    summary: 'Collect metrics for all channels',
    response: {
      200: triggerCollectionResponseSchema,
      500: z.object({
        error: z.string()
      })
    }
  }
};

export const triggerCollectionChannelDocs = {
  schema: {
    description: 'Trigger metrics collection for a specific channel',
    tags: ['metrics'],
    summary: 'Collect metrics for one channel',
    params: triggerCollectionParamsSchema,
    response: {
      200: triggerCollectionResponseSchema,
      404: z.object({
        message: z.string()
      }),
      500: z.object({
        error: z.string()
      })
    }
  }
};

export const triggerCollectionPageDocs = {
  schema: {
    description: 'Trigger metrics collection for a specific page',
    tags: ['metrics'],
    summary: 'Collect metrics for one page',
    params: triggerCollectionPageParamsSchema,
    response: {
      200: triggerCollectionResponseSchema,
      404: z.object({
        message: z.string()
      }),
      500: z.object({
        error: z.string()
      })
    }
  }
};
