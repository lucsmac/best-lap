import { z } from "zod";
import { MetricEnum } from "../../channel-metrics/utils/metrics-schemas";

export const querySchema = z.object({
  metric: MetricEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const requestParamsSchema = z.object({
  period: z.enum(["daily", "hourly", "weekly"]),
})

export const themeRequestParamsSchema = z.object({
  period: z.enum(["daily", "hourly", "weekly"]),
  theme: z.string(),
})
