import z from "zod";

export const deletePageRequestParamsSchema = z.object({
  channel_id: z.uuid(),
  page_id: z.uuid(),
});
