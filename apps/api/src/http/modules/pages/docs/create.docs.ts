import { z } from 'zod';

export const createPageDocs = {
  schema: {
    description: 'Create a page',
    tags: ['pages'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID')
    }),
    body: z.object({
      path: z.string().describe('Path of the page'),
      title: z.string().describe('Title of the page'),
    }),
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