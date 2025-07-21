import { ChannelEntity } from "./channel-entity.interface";

export interface ChannelsRepository {
  create(params: ChannelEntity): Promise<ChannelEntity>
  delete(channelId: string): Promise<void>
  listAll(): Promise<ChannelEntity[]>
  listAllReferences(): Promise<ChannelEntity[]>
  listAllClients(): Promise<ChannelEntity[]>
  listByTheme(theme: string): Promise<ChannelEntity[]>
  findById(id: string): Promise<ChannelEntity | null>
  findByLink(id: string): Promise<ChannelEntity | null>
  update(channelId: string, data: Partial<ChannelEntity>): Promise<void>
}
