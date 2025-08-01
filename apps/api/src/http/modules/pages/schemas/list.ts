import z from "zod";

export const listPagesRequestParamsSchema = z.object({
  channel_id: z.uuid(),
});
