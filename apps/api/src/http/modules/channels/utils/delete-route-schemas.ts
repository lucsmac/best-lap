import { z } from "zod";

export const deleteChannelRequestParamsSchema = z.object({
  channel_id: z.string().uuid()
})
