import { ProviderAlreadyExists } from "../../errors";
import { ProviderRepository } from "../../modules";

interface CreateProviderUseCaseRequest {
  name: string;
  website: string;
  slug: string;
  description?: string;
}

export class CreateProviderUseCase {
  constructor(private providersRepository: ProviderRepository) { }

  async execute({ name, website, slug, description }: CreateProviderUseCaseRequest) {
    const providerAlreadyExists = await this.providersRepository.findBySlug(slug)

    if (providerAlreadyExists) {
      throw new ProviderAlreadyExists()
    }

    const createdProvider = await this.providersRepository.create({
      name,
      website,
      slug,
      description,
    })

    return createdProvider
  }
}
