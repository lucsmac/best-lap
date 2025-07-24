import { ChannelEntity } from "@best-lap/core";
import { TypeormChannelsRepository } from "@best-lap/infra";
import { FastifyReply } from "fastify";

export async function listChannels(_: unknown, reply: FastifyReply) {
  try {
    const channelsRepository = new TypeormChannelsRepository()
    const channelsList: ChannelEntity[] = await channelsRepository.listAll() as ChannelEntity[]

    return reply.code(200).send({ channels_count: channelsList.length, channels: channelsList })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
