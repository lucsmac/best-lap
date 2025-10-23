import { z } from 'zod';

export const createChannelDocs = {
  schema: {
    description: 'Create a channel',
    tags: ['channels'],
    body: z.object({
      domain: z.string().describe('Domain of the channel'),
      internal_link: z.string().optional().describe('Internal link of the channel'),
      is_reference: z.boolean().optional().describe('Indicates if the channel is a reference channel'),
      name: z.string().describe('Name of the channel'),
      theme: z.string().optional().describe('Theme of the channel'),
      provider_id: z.string().uuid().optional().nullable().describe('ID of the provider associated with the channel')
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