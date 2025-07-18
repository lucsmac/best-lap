import { z } from "zod";

export const createChannelBodySchema = z.object({
  name: z.string(),
  domain: z.string(),
  internal_link: z.string(),
  theme: z.string(),
  is_reference: z.boolean().optional(),
})