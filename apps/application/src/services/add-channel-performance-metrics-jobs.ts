import { JobsOptions, Queue } from "bullmq";
import { IChannel } from "@/models/entities";

export class AddChannelPerformanceMetricsJobs{
  async execute(channel: IChannel, config: JobsOptions, queue: Queue) {
    await queue.add(
      'collectChannelPerformanceMetric',
      {
        channelUrl: channel.internal_link,
        channelId: channel.id
      },
      {
        ...config,
        jobId: `collect-metrics-${channel.id}`
      }
    )
  }
}
