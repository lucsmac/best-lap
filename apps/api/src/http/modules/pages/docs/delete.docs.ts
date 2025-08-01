import { z } from 'zod';

export const deletePageDocs = {
  schema: {
    description: 'Delete a page',
    tags: ['pages'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID'),
      page_id: z.string().describe('Must be a valid page ID')
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