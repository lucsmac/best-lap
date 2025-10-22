import { NoDataProvided, ResourceNotFound } from "../../errors";
import { ProviderRepository } from "../../modules";

interface DataToUpdateProvider {
  name?: string;
  website?: string;
  slug?: string;
  description?: string;
}

export class EditProviderUseCase {
  constructor(private providersRepository: ProviderRepository) { }

  async execute(provider_id: string, dataToUpdate: DataToUpdateProvider) {
    const provider = await this.providersRepository.findById(provider_id)

    if (!provider) {
      throw new ResourceNotFound()
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new NoDataProvided();
    }

    await this.providersRepository.update(provider_id, dataToUpdate)
  }
}
