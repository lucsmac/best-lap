import { JobsOptions } from "bullmq";
import { AddChannelsPerformanceMetricsJobs } from "../services";
import { IChannel } from "@/models/entities";
import { ChannelsRepository } from "@/data/repositories";

const referenceChannelsConfig: JobsOptions = {
  repeat: {
    pattern: '*/30 * * * *',
    utc: true
  }
}

export class SetCollectReferencesChannelMetricsJobsUseCase {
  constructor (private channelsRepository: ChannelsRepository) {}
  
  async execute(channels: IChannel[] = []) {
    const referencesChannelsList: IChannel[] = channels ? channels : await this.channelsRepository.listAllReferences() as IChannel[]

    if (!referencesChannelsList || referencesChannelsList.length === 0) {
      console.log('No reference channels available to collect metrics.')
      
      return
    }
    
    const addChannelsPerformanceMetricsJobs = new AddChannelsPerformanceMetricsJobs()
    addChannelsPerformanceMetricsJobs
      .execute(referencesChannelsList, referenceChannelsConfig)
  }
}
