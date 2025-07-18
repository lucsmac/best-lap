import { FastifyReply } from "fastify";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";
import { IChannel } from "@/models/entities";

export async function listChannels(_: unknown, reply: FastifyReply) {
  try {
    const channelsRepository = new TypeormChannelsRepository()
    const channelsList: IChannel[] = await channelsRepository.listAll() as IChannel[]
    
    return reply.code(200).send({ channels_count: channelsList.length, channels: channelsList })
  } catch(error) {
    console.error(error);
    
    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
