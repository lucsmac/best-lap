import { z } from 'zod';

export const createProviderDocs = {
  schema: {
    description: 'Create a provider',
    tags: ['providers'],
    body: z.object({
      name: z.string().describe('Name of the provider'),
      website: z.string().describe('Website of the provider'),
      slug: z.string().describe('Unique slug for the provider'),
      description: z.string().optional().describe('Description of the provider')
    }),
    response: {
      201: z.object({
        message: z.string().optional().describe('Success message')
      }),
      409: z.object({
        message: z.string()
      }),
      500: z.object({
        error: z.string()
      })
    }
  }
}
