import { z } from 'zod';

export const editPageDocs = {
  schema: {
    description: 'Edit a page',
    tags: ['pages'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID'),
      page_id: z.string().describe('Must be a valid page ID')
    }),
    body: z.object({
      path: z.string().optional().describe('Path of the page'),
      name: z.string().optional().describe('Name of the page'),
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