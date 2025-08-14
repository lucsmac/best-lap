import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository, TypeormPagesRepository } from "@best-lap/infra";
import { editPageRequestBodySchema, editPageRequestParamsSchema } from "../schemas/edit";
import { EditPageUseCase } from "@best-lap/core";

export async function editPage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id, page_id } = editPageRequestParamsSchema.parse(request.params)
    const dataToUpdate = editPageRequestBodySchema.parse(request.body)

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists" })

    const pagesRepository = new TypeormPagesRepository()
    const editPageUseCase = new EditPageUseCase(pagesRepository)

    await editPageUseCase.execute(page_id, dataToUpdate)

    return reply.code(204).send({ message: 'Page updated successfully' })
  } catch (error) {
    console.error(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
