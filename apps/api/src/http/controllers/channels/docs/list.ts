import { z } from 'zod';

export const listChannelDocs = {
  schema: {
    description: 'List all channels',
    tags: ['channels'],
    response: {
      201: z.object({
        message: z.string().optional().describe('Success message')
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