import { NoDataProvided, ResourceNotFound } from "../../errors";
import { ChannelsRepository } from "../../modules";

interface DataToUpdateChannel {
  domain?: string;
  internal_link?: string;
  is_reference?: boolean;
  active?: boolean;
  name?: string;
  theme?: string;
  provider_id?: string | null;
}

export class EditChannelUseCase {
  constructor(private channelsRepository: ChannelsRepository) { }

  async execute(channel_id: string, dataToUpdate: DataToUpdateChannel) {
    const channel = await this.channelsRepository.findById(channel_id)

    if (!channel) {
      throw new ResourceNotFound()
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new NoDataProvided();
    }

    // Convert null to undefined for provider_id
    const sanitizedData = {
      ...dataToUpdate,
      provider_id: dataToUpdate.provider_id === null ? undefined : dataToUpdate.provider_id,
    }

    await this.channelsRepository.update(channel_id, sanitizedData)
  }
}