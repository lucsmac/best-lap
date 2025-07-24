import { ResourceNotFound } from "../../errors";
import { PageRepository } from "../../modules";

export class DeletePageUseCase {
  constructor(private pagesRepository: PageRepository) { }

  async execute(pageId: string): Promise<void> {
    const page = await this.pagesRepository.findById(pageId);

    if (!page) {
      throw new ResourceNotFound(`Page with ID ${pageId} not found`);
    }

    await this.pagesRepository.delete(pageId);
  }
}