import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository, TypeormPagesRepository } from "@best-lap/infra";
import { DeletePageUseCase, ResourceNotFound } from "@best-lap/core";
import { deletePageRequestParamsSchema } from "./schemas/delete";

export async function deletePage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id, page_id } = deletePageRequestParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists" })

    const pagesRepository = new TypeormPagesRepository()
    const deletePageUseCase = new DeletePageUseCase(pagesRepository)

    await deletePageUseCase.execute(page_id)

    return reply.code(204).send({ message: 'Page deleted successfully' })
  } catch (error) {
    console.log(error)

    if (error instanceof ResourceNotFound) {
      return reply.status(404).send({ message: error.message })
    }

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
