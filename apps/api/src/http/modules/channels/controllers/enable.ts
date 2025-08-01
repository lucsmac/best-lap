import { FastifyReply, FastifyRequest } from "fastify";
import { enableChannelRequestParamsSchema } from "../utils/enable-channel-route-schema";
import { ChannelAlreadyExists, EditChannelUseCase } from "@best-lap/core";
import { TypeormChannelsRepository } from "@best-lap/infra";

export async function enableChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = enableChannelRequestParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists" })

    const editChannelUseCase = new EditChannelUseCase(channelsRepository)
    await editChannelUseCase.execute(channel_id, { active: true })

    return reply.code(204).send({ message: 'Channel enabled successfully' });
  } catch (error) {
    console.error(error);

    if (error instanceof ChannelAlreadyExists) {
      return reply.status(409).send({ message: error.message })
    }

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
