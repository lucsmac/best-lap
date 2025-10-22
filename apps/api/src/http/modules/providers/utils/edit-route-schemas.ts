import { z } from "zod";

export const editProviderRequestParamsSchema = z.object({
  provider_id: z.uuid(),
})

export const editProviderRequestBodySchema = z.object({
  name: z.string().optional(),
  website: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
})
