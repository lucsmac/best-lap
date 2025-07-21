import { PageEntity } from "./page-entity.interface";

export interface PageRepository {
  create(params: PageEntity): Promise<PageEntity>
  delete(pageId: string): Promise<void>
  listAll(): Promise<PageEntity[]>
  listByChannel(channel_id: string): Promise<PageEntity[]>
  findById(id: string): Promise<PageEntity | null>
  update(channelId: string, data: Partial<PageEntity>): Promise<void>
}
