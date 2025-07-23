import { TypeormMetricsRepository } from "@best-lap/infra";
import { CollectPageMetricsService } from "../services";

type MakeCollectPageMetricsServiceParams = {
  pageUrl: string;
  pageId: string;
}

export const MakeCollectPageMetricsService = async ({ pageUrl, pageId }: MakeCollectPageMetricsServiceParams) => {
  try {
    const metricsRepository = new TypeormMetricsRepository()
    const collectPageMetricsService = new CollectPageMetricsService(metricsRepository)

    await collectPageMetricsService.execute({ pageUrl, pageId });
  } catch (error) {
    console.error(`Error fetching or processing metrics for channel: ${pageUrl}`, error);
  }
}
