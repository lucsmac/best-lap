import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";
import { DeleteChannelCollectJobService } from "@/application/services";
import { disableChannelRequestParamsSchema } from "./utils/disable-channel-route-schema";

export async function disableChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = disableChannelRequestParamsSchema.parse(request.params);
    
    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists"})

    const deleteChannelCollectJobService = new DeleteChannelCollectJobService()
    await deleteChannelCollectJobService.execute(channel_id, !!channel.is_reference)

    return reply.code(204).send()
  } catch(error) {
    console.log(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
