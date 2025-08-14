import { ChannelEntity } from "@best-lap/core";
import { TypeormChannelsRepository } from "@best-lap/infra";
import { FastifyReply, FastifyRequest } from "fastify";
import { showChannelRequestParamsSchema } from "../utils/show-channel-route-schema";

export async function showChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = showChannelRequestParamsSchema.parse(request.params)

    const channelsRepository = new TypeormChannelsRepository()
    const channel: ChannelEntity = await channelsRepository.findById(channel_id) as ChannelEntity

    return reply.code(200).send({ channel })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
