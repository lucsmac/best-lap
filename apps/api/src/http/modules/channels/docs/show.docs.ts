import { z } from 'zod';

export const showChannelDocs = {
  schema: {
    description: 'Show channel',
    tags: ['channels'],
    response: {
      200: z.object({
        channel: z.object({
          id: z.uuid().describe('Channel ID'),
          domain: z.string().describe('Domain of the channel'),
          internal_link: z.string().optional().describe('Internal link of the channel'),
          is_reference: z.boolean().optional().describe('Indicates if the channel is a reference channel'),
          name: z.string().describe('Name of the channel'),
          theme: z.string().optional().describe('Theme of the channel'),
          active: z.boolean().describe('Indicates if the channel is active'),
          created_at: z.date().describe('Creation date of the channel'),
          updated_at: z.date().optional().describe('Last update date of the channel')
        }).describe('Details of channel')
      }).describe('Channel with their details'),
      404: z.object({
        message: z.string()
      }),
      500: z.object({
        error: z.string()
      })
    }
  }
}