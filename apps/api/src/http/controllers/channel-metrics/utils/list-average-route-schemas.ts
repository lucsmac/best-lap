import { z } from "zod";

export const requestParamsSchema = z.object({
  period: z.enum(["daily", "hourly", "weekly"]),
})

export const themeRequestParamsSchema = z.object({
  period: z.enum(["daily", "hourly", "weekly"]),
  theme: z.string(),
})

export const channelRequestParamsSchema = z.object({
  period: z.enum(["daily", "hourly", "weekly"]),
  channel_id: z.string(),
})