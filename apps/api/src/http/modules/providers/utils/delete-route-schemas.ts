import { z } from "zod";

export const deleteProviderRequestParamsSchema = z.object({
  provider_id: z.uuid()
})
