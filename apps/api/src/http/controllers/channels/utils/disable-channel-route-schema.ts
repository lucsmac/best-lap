import { z } from "zod";

export const disableChannelRequestParamsSchema = z.object({
  channel_id: z.string().uuid()
})
