import { z } from 'zod';

export const listChannelsDocs = {
  schema: {
    description: 'List all channels',
    tags: ['channels'],
    response: {
      200: z.object({
        channels_count: z.number().describe('Total number of channels'),
        channels: z.array(z.object({
          id: z.uuid().describe('Channel ID'),
          domain: z.string().describe('Domain of the channel'),
          internal_link: z.string().optional().describe('Internal link of the channel'),
          is_reference: z.boolean().optional().describe('Indicates if the channel is a reference channel'),
          name: z.string().describe('Name of the channel'),
          theme: z.string().optional().describe('Theme of the channel'),
          active: z.boolean().describe('Indicates if the channel is active'),
          provider_id: z.string().uuid().optional().nullable().describe('ID of the provider associated with the channel'),
          provider: z.object({
            id: z.uuid().describe('Provider ID'),
            name: z.string().describe('Provider name'),
            website: z.string().describe('Provider website'),
            slug: z.string().describe('Provider slug'),
            description: z.string().optional().nullable().describe('Provider description'),
            created_at: z.date().describe('Provider creation date'),
            updated_at: z.date().describe('Provider last update date')
          }).optional().nullable().describe('Provider details'),
          created_at: z.date().describe('Creation date of the channel'),
          updated_at: z.date().optional().describe('Last update date of the channel')
        })).describe('List of channels')
      }).describe('List of channels with their details'),
      404: z.object({
        message: z.string()
      }),
      500: z.object({
        error: z.string()
      })
    }
  }
}