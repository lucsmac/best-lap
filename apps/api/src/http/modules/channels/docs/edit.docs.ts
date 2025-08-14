import { z } from 'zod';

export const editChannelDocs = {
  schema: {
    description: 'Edit a channel',
    tags: ['channels'],
    params: z.object({
      channel_id: z.uuid().describe('Must be a valid channel ID')
    }),
    body: z.object({
      domain: z.string().optional().describe('Domain of the channel'),
      internal_link: z.string().optional().describe('Internal link of the channel'),
      is_reference: z.boolean().optional().describe('Indicates if the channel is a reference channel'),
      name: z.string().optional().describe('Name of the channel'),
      theme: z.string().optional().describe('Theme of the channel')
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