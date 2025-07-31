import { FastifyReply, FastifyRequest } from "fastify";
import { deleteChannelRequestParamsSchema } from "./utils/delete-route-schemas";
import { TypeormChannelsRepository } from "@best-lap/infra";
import { DeleteChannelUseCase } from "@best-lap/core";

export async function deleteChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = deleteChannelRequestParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists" })

    const deleteChannelUseCase = new DeleteChannelUseCase(channelsRepository)
    await deleteChannelUseCase.execute(channel_id)

    return reply.code(204).send({ message: "Channel deleted successfully." });
  } catch (error) {
    console.log(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
