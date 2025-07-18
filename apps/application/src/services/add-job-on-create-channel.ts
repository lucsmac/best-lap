import { ChannelEntity } from "../modules/channel/entity/channel-entity.interface";
import { ChannelsRepository } from "../modules/channel/repository/channel-repository";
import {
  SetCollectReferencesChannelMetricsJobsUseCase,
  SetCollectClientsChannelMetricsJobsUseCase
} from "../usecases";

export class AddJobOnCreateChannel {
  constructor (private channelsRepository: ChannelsRepository) {}
  
  async execute(channel: ChannelEntity) {
    let setJobsUseCase;

    if (channel.is_reference) {
      setJobsUseCase = new SetCollectReferencesChannelMetricsJobsUseCase(this.channelsRepository)
    } else {
      setJobsUseCase = new SetCollectClientsChannelMetricsJobsUseCase(this.channelsRepository)
    }
     
    setJobsUseCase.execute([channel])
  }
}
