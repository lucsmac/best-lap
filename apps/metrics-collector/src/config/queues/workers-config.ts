import { queuesMap } from './map';
import { makeCollectPageMetricsService } from '../../factories';
import { QueueType } from '@best-lap/infra';

type Job = {
  data: {
    pageUrl: string;
    pageId: string;
  };
};

const collectPageMetricsService = makeCollectPageMetricsService();

export const metricsWorkersConfig = Object.values(queuesMap).map((queue) => ({
  queueName: queue.name as QueueType,
  processor: async (job: Job) => {
    const { pageUrl, pageId } = job.data;

    try {
      await collectPageMetricsService.execute({ pageUrl, pageId });
    } catch (error) {
      console.error(
        `[${queue.name}] Failed to collect metrics for page with ID ${pageId} and URL (${pageUrl})`,
        error
      );
    }
  },
}));
