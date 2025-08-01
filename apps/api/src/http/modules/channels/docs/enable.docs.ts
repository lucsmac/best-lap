import { z } from 'zod';

export const enableChannelDocs = {
  schema: {
    description: 'Enable a channel',
    tags: ['channels'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID')
    }),
    response: {
      200: z.object({
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