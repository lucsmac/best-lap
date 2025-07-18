import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";
import { deleteChannelRequestParamsSchema } from "./utils/delete-route-schemas";
import { DeleteChannelUseCase } from "@/application/usecases";
import { DeleteChannelCollectJobService } from "@/application/services";

export async function deleteChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = deleteChannelRequestParamsSchema.parse(request.params);
    
    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists"})

    const deleteChannelUseCase = new DeleteChannelUseCase(channelsRepository)
    await deleteChannelUseCase.execute(channel_id)

    const deleteChannelCollectJobService = new DeleteChannelCollectJobService()
    await deleteChannelCollectJobService.execute(channel_id, !!channel.is_reference)

    return reply.code(204).send()
  } catch(error) {
    console.log(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
