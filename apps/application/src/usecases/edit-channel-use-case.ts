import { ChannelsRepository } from "@/data/repositories";
import { NoDataProvided, ResourceNotFound } from "@/models/errors";

interface DataToUpdateChannel {
  domain?: string;
  internal_link?: string;
  is_reference?: boolean;
  name?: string;
  theme?: string;
}

export class EditChannelUseCase {
  constructor(private channelsRepository: ChannelsRepository) {}
  
  async execute(channel_id: string, dataToUpdate: DataToUpdateChannel) {
    const channel = await this.channelsRepository.findById(channel_id)

    if (!channel) {
      throw new ResourceNotFound()
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new NoDataProvided();
    }
    
    await this.channelsRepository.update(channel_id, dataToUpdate)
  }
}