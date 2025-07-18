import { z } from "zod";

export const enableChannelRequestParamsSchema = z.object({
  channel_id: z.string().uuid()
})
