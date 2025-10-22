import { z } from "zod";

export const createProviderBodySchema = z.object({
  name: z.string(),
  website: z.string(),
  slug: z.string(),
  description: z.string().optional(),
})
