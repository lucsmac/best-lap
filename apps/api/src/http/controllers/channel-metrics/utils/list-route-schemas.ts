import { z } from "zod";
import { MetricEnum } from "./metrics-schemas";

export const querySchema = z.object({
  metric: MetricEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const requestParamsSchema = z.object({
  channel_id: z.string(),
})
