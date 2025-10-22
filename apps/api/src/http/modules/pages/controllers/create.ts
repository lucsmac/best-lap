import { FastifyReply, FastifyRequest } from "fastify";
import { createPageBodySchema, createPageRequestParamsSchema } from "../schemas/create";
import { TypeormChannelsRepository, TypeormPagesRepository } from "@best-lap/infra";
import { CreatePageUseCase, PageAlreadyExists } from "@best-lap/core";

export async function createPage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = createPageRequestParamsSchema.parse(request.params);
    const { path, name, provider_id } = createPageBodySchema.parse(request.body)

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) {
      return reply.code(400).send({ error: "Channel doesn't exist" });
    }

    const pagesRepository = new TypeormPagesRepository()
    const createPageUseCase = new CreatePageUseCase(pagesRepository)

    await createPageUseCase.execute({ channel_id, path, name, provider_id })

    return reply.code(201).send({ message: 'Page created successfully' });
  } catch (error) {
    console.error(error);

    if (error instanceof PageAlreadyExists) {
      return reply.status(409).send({ message: error.message })
    }

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
