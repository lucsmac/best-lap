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
          pages: z.array(z.object({
            id: z.uuid().describe('Page ID'),
            name: z.string().describe('Page name'),
            path: z.string().describe('Page path'),
            channel_id: z.string().uuid().describe('Channel ID'),
            provider_id: z.string().uuid().optional().nullable().describe('Provider ID'),
            created_at: z.date().describe('Page creation date'),
            updated_at: z.date().describe('Page last update date')
          })).optional().describe('Pages associated with the channel'),
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