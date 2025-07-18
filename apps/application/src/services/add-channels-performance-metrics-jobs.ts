import { JobsOptions, Queue } from "bullmq";
import { mainQueue } from "@/infra/queue/queues";
import { IChannel } from "@/models/entities";
import { AddChannelPerformanceMetricsJobs } from "./add-channel-performance-metrics-jobs";

const defaultConfig: JobsOptions = {
  removeOnComplete: {
    age: 3600,
    count: 1000,
  },
  removeOnFail: {
    age: 24 * 3600
  }
}

interface Config {
  queue?: Queue
}

export class AddChannelsPerformanceMetricsJobs{
  async execute(channelsList: IChannel[], customJobConfig: JobsOptions = {}, config: Config = {}) {
    if (channelsList?.length === 0) {
      console.log('We have no channels to see metrics.')
      return
    }

    const queue = config.queue || mainQueue
    const addChannelCollectJob = new AddChannelPerformanceMetricsJobs()
    
    for(const channel of channelsList) {
      const config = {
        ...defaultConfig,
        ...customJobConfig
      }

      await addChannelCollectJob.execute(channel, config, queue)
    }
    
    this.successLog(channelsList, customJobConfig)
  }

  successLog(channelsList: IChannel[], customJobConfig: JobsOptions) {
    console.log(`Collect metrics from ${channelsList?.length} channels with these custom config: ${JSON.stringify(customJobConfig)}.`)
  }
}
