// import { JobsOptions } from "bullmq";
import { AddChannelsPerformanceMetricsJobs } from "../../../../apps/metrics-collector/src/services";
import { ChannelEntity, ChannelsRepository } from "../modules";

// const referenceChannelsConfig: JobsOptions = {
//   repeat: {
//     pattern: '*/30 * * * *',
//     utc: true
//   }
// }
const referenceChannelsConfig = undefined;

export class SetCollectReferencesChannelMetricsJobsUseCase {
  constructor(private channelsRepository: ChannelsRepository) { }

  async execute(channels: ChannelEntity[] = []) {
    const referencesChannelsList: ChannelEntity[] = channels ? channels : await this.channelsRepository.listAllReferences() as ChannelEntity[]

    if (!referencesChannelsList || referencesChannelsList.length === 0) {
      console.log('No reference channels available to collect metrics.')

      return
    }

    const addChannelsPerformanceMetricsJobs = new AddChannelsPerformanceMetricsJobs()
    addChannelsPerformanceMetricsJobs
      .execute(referencesChannelsList, referenceChannelsConfig)
  }
}
