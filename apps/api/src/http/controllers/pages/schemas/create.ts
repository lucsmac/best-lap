import { z } from "zod";

export const createPageBodySchema = z.object({
  name: z.string(),
  path: z.string(),
})

export const createPageRequestParamsSchema = z.object({
  channel_id: z.uuid()
})
