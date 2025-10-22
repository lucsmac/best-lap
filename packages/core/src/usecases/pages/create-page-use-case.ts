import { PageAlreadyExists } from "../../errors/page-already-exists";
import { PageRepository } from "../../modules";

interface CreatePageUseCaseRequest {
  channel_id: string;
  path: string;
  name: string;
  provider_id?: string;
}

export class CreatePageUseCase {
  constructor(private pagesRepository: PageRepository) { }

  async execute({ channel_id, name, path, provider_id }: CreatePageUseCaseRequest) {
    const pageAlreadyExists = await this.pagesRepository.findByPathFromChannel({ channel_id, path });

    if (pageAlreadyExists) {
      throw new PageAlreadyExists()
    }

    const createdChannel = await this.pagesRepository.create({
      channel_id,
      path,
      name,
      provider_id,
    })

    return createdChannel
  }
}
