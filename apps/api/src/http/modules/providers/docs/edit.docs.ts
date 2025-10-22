import { z } from 'zod';

export const editProviderDocs = {
  schema: {
    description: 'Edit a provider',
    tags: ['providers'],
    params: z.object({
      provider_id: z.uuid().describe('Provider ID')
    }),
    body: z.object({
      name: z.string().optional().describe('Name of the provider'),
      website: z.string().optional().describe('Website of the provider'),
      slug: z.string().optional().describe('Unique slug for the provider'),
      description: z.string().optional().describe('Description of the provider')
    }),
    response: {
      204: z.object({
        message: z.string().optional().describe('Success message')
      }),
      404: z.object({
        error: z.string()
      }),
      500: z.object({
        error: z.string()
      })
    }
  }
}
