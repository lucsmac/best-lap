import { NoDataProvided, ResourceNotFound } from "../../errors";
import { PageRepository } from "../../modules";

export class EditPageUseCase {
  constructor(private pagesRepository: PageRepository) { }

  async execute(page_id: string, dataToUpdate: { name?: string; path?: string }) {
    const page = await this.pagesRepository.findById(page_id);

    if (!page) {
      throw new ResourceNotFound();
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new NoDataProvided();
    }

    await this.pagesRepository.update(page_id, dataToUpdate);
  }
}