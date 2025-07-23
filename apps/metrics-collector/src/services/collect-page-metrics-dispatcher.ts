import { ChannelsRepository, MetricsQueue } from "@best-lap/core";

export class CollectPageMetricsDispatcher {
  constructor(private channelsRepository: ChannelsRepository, private metricsQueue: MetricsQueue) {
    this.channelsRepository = channelsRepository;
    this.metricsQueue = metricsQueue
  }

  async execute() {
    const activeChannels = await this.channelsRepository.listActiveChannels();

    if (activeChannels.length === 0) {
      console.log('No active channels found for metrics collection.');
      return;
    }

    for (const channel of activeChannels) {
      if (!channel.internal_link) {
        console.warn(`Channel with ID ${channel.id} does not have a URL, skipping metrics collection.`);
        continue;
      }

      channel.pages.forEach(page => {
        if (!page.path) {
          console.warn(`Page with ID ${page.id} does not have a URL, skipping metrics collection.`);
          return;
        }

        const collectPageMetricsJobParams = {
          pageUrl: `${channel.internal_link}${page.path}`,
          pageId: page.id,
        }

        try {
          this.metricsQueue.setJob({
            type: channel.is_reference ? '' : 'client',
            data: collectPageMetricsJobParams
          });

          console.log(`Metrics collection job added for channel: ${collectPageMetricsJobParams.pageUrl}`);
        } catch (error) {
          console.error(`Error adding metrics collection job for channel: ${collectPageMetricsJobParams.pageUrl}`, error);
        }
      });
    }
  }
}
