import { z } from "zod";

export const showChannelRequestParamsSchema = z.object({
  channel_id: z.uuid(),
})
