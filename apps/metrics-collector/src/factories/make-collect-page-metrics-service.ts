import { TypeormMetricsRepository } from "@best-lap/infra";
import { CollectPageMetricsService } from "../services";

export const makeCollectPageMetricsService = () => {
  const metricsRepository = new TypeormMetricsRepository()
  const collectPageMetricsService = new CollectPageMetricsService(metricsRepository)

  return collectPageMetricsService
}
