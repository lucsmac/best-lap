import { z } from "zod";

export const showProviderRequestParamsSchema = z.object({
  provider_id: z.uuid()
})
