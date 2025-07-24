import { PageEntity, PageRepository } from "@best-lap/core";
import { dataSource } from "../../database/data-source";
import { Page } from "../entities";

const PageRepository = dataSource.getRepository<Page>(Page);

export class TypeormPagesRepository implements PageRepository {
  async create(params: PageEntity): Promise<PageEntity> {
    const pageData = PageRepository.create(params);
    return await PageRepository.save(pageData);
  }

  async delete(pageId: string): Promise<void> {
    await PageRepository.delete({ id: pageId });
  }

  async findByPath(channel_id: string, path: string): Promise<PageEntity | null> {
    return await PageRepository.findOne({
      where: {
        channel_id,
        path
      }
    }) || null;
  }

  async listAll(): Promise<PageEntity[]> {
    return await PageRepository.find();
  }

  async listByChannel(channel_id: string): Promise<PageEntity[]> {
    return await PageRepository.find({
      where: {
        channel_id: channel_id
      }
    });
  }

  async findById(id: string): Promise<PageEntity | null> {
    return await PageRepository.findOne({ where: { id } }) || null;
  }

  async update(channelId: string, data: Partial<PageEntity>): Promise<void> {
    await PageRepository.update({ id: channelId }, data);
  }
}