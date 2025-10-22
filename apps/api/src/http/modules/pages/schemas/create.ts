import { z } from "zod";

export const createPageRequestParamsSchema = z.object({
  channel_id: z.uuid()
})

export const createPageBodySchema = z.object({
  name: z.string(),
  path: z.string(),
  provider_id: z.uuid().optional(),
})
