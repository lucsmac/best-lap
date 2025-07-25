import { PageEntity, PageRepository } from "@best-lap/core";
import { dataSource } from "../../database/data-source";
import { Page } from "../entities";

const pageRepository = dataSource.getRepository<Page>(Page);

export class TypeormPagesRepository implements PageRepository {
  async create(params: PageEntity): Promise<PageEntity> {
    const pageData = pageRepository.create(params);
    return await pageRepository.save(pageData);
  }

  async delete(pageId: string): Promise<void> {
    await pageRepository.delete({ id: pageId });
  }

  async findByPath(path: string): Promise<PageEntity | null> {
    return await pageRepository.findOne({
      where: {
        path
      }
    }) || null;
  }

  async listAllByChannel(channel_id: string): Promise<PageEntity[]> {
    const pages = await pageRepository.find({
      where: {
        channel_id: channel_id
      }
    });

    return pages.map(page => page as PageEntity);
  }

  async findByPathFromChannel({ channel_id, path }: { channel_id: string; path: string }): Promise<PageEntity | null> {
    return await pageRepository.findOne({
      where: {
        channel_id,
        path
      }
    }) || null;
  }

  async listByChannel(channel_id: string): Promise<PageEntity[]> {
    return await pageRepository.find({
      where: {
        channel_id: channel_id
      }
    });
  }

  async findById(id: string): Promise<PageEntity | null> {
    return await pageRepository.findOne({ where: { id } }) || null;
  }

  async update(channelId: string, data: Partial<PageEntity>): Promise<void> {
    await pageRepository.update({ id: channelId }, data);
  }
}