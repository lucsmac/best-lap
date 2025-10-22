import { ProviderEntity, ProviderRepository } from "@best-lap/core";
import { Provider as ProviderModel } from "../entities/provider-entity";
import { dataSource } from "../../database/data-source";

const providerRepository = dataSource.getRepository<ProviderModel>(ProviderModel);

export class TypeormProvidersRepository implements ProviderRepository {
  async create(params: ProviderEntity): Promise<ProviderEntity> {
    const providerData = providerRepository.create(params)
    const createdProvider = await providerRepository.save(providerData)

    return createdProvider
  }

  async update(provider_id: string, data: Partial<ProviderEntity>) {
    await providerRepository.update(provider_id, data)
  }

  async delete(providerId: string): Promise<void> {
    await providerRepository.delete(providerId)
  }

  async listAll(): Promise<ProviderEntity[]> {
    return await providerRepository.find({
      relations: ['pages']
    })
  }

  async findBySlug(slug: string): Promise<ProviderEntity | null> {
    const provider = await providerRepository.findOne({
      where: {
        slug
      }
    })

    return provider
  }

  async findById(id: string): Promise<ProviderEntity | null> {
    const provider = await providerRepository.findOne({
      where: {
        id
      },
      relations: ['pages']
    })

    return provider
  }
}
