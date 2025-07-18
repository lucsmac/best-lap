import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";
import { ChannelAlreadyExists } from "@/models/errors";
import { AddJobOnCreateChannel } from "@/application/services";
import { enableChannelRequestParamsSchema } from "./utils/enable-channel-route-schema copy";

export async function enableChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = enableChannelRequestParamsSchema.parse(request.params);
    
    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists"})

    const addJobOnCreateChannel = new AddJobOnCreateChannel(channelsRepository)
    await addJobOnCreateChannel.execute(channel)

    return reply.code(201).send()
  } catch(error) {
    console.error(error);
    
    if (error instanceof ChannelAlreadyExists) {
      return reply.status(409).send({ message: error.message })
    }
    
    return reply.code(500).send({ error: 'Internal Server Error.'})
  }
}
