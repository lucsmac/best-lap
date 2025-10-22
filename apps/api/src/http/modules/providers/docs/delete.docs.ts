import { z } from 'zod';

export const deleteProviderDocs = {
  schema: {
    description: 'Delete a provider',
    tags: ['providers'],
    params: z.object({
      provider_id: z.uuid().describe('Provider ID')
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
