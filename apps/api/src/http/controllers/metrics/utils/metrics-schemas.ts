import { z } from "zod";

const metricEnum = ["score", "responseTime", "fcp", "si", "lcp", "tbt", "cls"] as const;
export type MetricsOptions = (typeof metricEnum)[number];
export const MetricEnum = z.enum(metricEnum);