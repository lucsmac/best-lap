import { z } from "zod";

export const editChannelRequestParamsSchema = z.object({
  channel_id: z.string().uuid(),
})

export const editChannelRequestBodySchema = z.object({
  domain: z.string().optional(),
  internal_link: z.string().optional(),
  is_reference: z.boolean().optional(),
  name: z.string().optional(),
  theme: z.string().optional(),
})
