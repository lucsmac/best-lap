import { z } from 'zod';

export const listPagesDocs = {
  schema: {
    description: 'List all pages for a specific channel',
    tags: ['pages'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID')
    }),
    response: {
      200: z.object({
        pages: z.array(z.object({
          id: z.uuid().describe('Page ID'),
          path: z.string().describe('Path of the page'),
          name: z.string().describe('Name of the page'),
        })),
      }).describe('List of pages for the channel'),
      404: z.object({
        message: z.string().describe('Error message if the channel does not exist')
      }),
      500: z.object({
        error: z.string().describe('Internal server error message')
      })
    }
  }
}