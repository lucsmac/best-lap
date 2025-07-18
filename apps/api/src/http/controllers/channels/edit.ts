import { FastifyReply, FastifyRequest } from "fastify";
import { editChannelRequestBodySchema, editChannelRequestParamsSchema } from "./utils/edit-route-schemas";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";
import { EditChannelUseCase } from "@/application/usecases";

export async function editChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = editChannelRequestParamsSchema.parse(request.params)
    const dataToUpdate = editChannelRequestBodySchema.parse(request.params)

    const channelsRepository = new TypeormChannelsRepository()
    const editChannelUseCase = new EditChannelUseCase(channelsRepository)

    await editChannelUseCase.execute(channel_id, dataToUpdate)

    return reply.code(204).send()
  } catch(error) {
    console.error(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  } 
}
