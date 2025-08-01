import { FastifyReply, FastifyRequest } from "fastify";
import { disableChannelRequestParamsSchema } from "./utils/disable-channel-route-schema";
import { TypeormChannelsRepository } from "@best-lap/infra";
import { EditChannelUseCase } from "@best-lap/core";

export async function disableChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = disableChannelRequestParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists" })

    const editChannelUseCase = new EditChannelUseCase(channelsRepository)
    await editChannelUseCase.execute(channel_id, { active: false })

    return reply.code(204).send({ message: "Channel disabled successfully." });
  } catch (error) {
    console.log(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
