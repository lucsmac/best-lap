import { PageAlreadyExists } from "../../errors/page-already-exists";
import { PageRepository } from "../../modules";

interface CreatePageUseCaseRequest {
  channel_id: string;
  path: string;
  name: string;
}

export class CreatePageUseCase {
  constructor(private pagesRepository: PageRepository) { }

  async execute({ channel_id, name, path }: CreatePageUseCaseRequest) {
    const pageAlreadyExists = await this.pagesRepository.findByPath(channel_id, path);

    if (pageAlreadyExists) {
      throw new PageAlreadyExists()
    }

    const createdChannel = await this.pagesRepository.create({
      channel_id,
      path,
      name,
    })

    return createdChannel
  }
}
