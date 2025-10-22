import { ProviderEntity } from "./provider-entity.interface";

export interface ProviderRepository {
  create(params: ProviderEntity): Promise<ProviderEntity>
  delete(providerId: string): Promise<void>
  listAll(): Promise<ProviderEntity[]>
  findById(id: string): Promise<ProviderEntity | null>
  findBySlug(slug: string): Promise<ProviderEntity | null>
  update(providerId: string, data: Partial<ProviderEntity>): Promise<void>
}
