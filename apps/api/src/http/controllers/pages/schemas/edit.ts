import z from "zod";

export const editPageRequestParamsSchema = z.object({
  channel_id: z.uuid(),
  page_id: z.uuid(),
});

export const editPageRequestBodySchema = z.object({
  name: z.string().optional(),
  path: z.string().optional(),
});
