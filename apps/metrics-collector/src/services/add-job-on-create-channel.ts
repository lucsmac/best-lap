import { ChannelEntity } from "../../../../packages/core/src/modules/channel/channel-entity.interface";
import { ChannelsRepository } from "../../../../packages/core/src/modules/channel/channel-repository.interface";
import {
  SetCollectReferencesChannelMetricsJobsUseCase,
  SetCollectClientsChannelMetricsJobsUseCase
} from "../../../../packages/core/src/usecases";

export class AddJobOnCreateChannel {
  constructor(private channelsRepository: ChannelsRepository) { }

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
