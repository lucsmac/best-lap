import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";

export async function listChannelsByTheme(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getRequestParamSchema = z.object({
      theme: z.string(),
    })

    const { theme } = getRequestParamSchema.parse(request.params);
    
    const channelsRepository = new TypeormChannelsRepository()
    const channelByTheme = await channelsRepository.listByTheme(theme)

    return reply.code(200).send({ channels_count: channelByTheme.length, channels: channelByTheme })
  } catch(error) {
    console.error(error)

    return reply.code(500).send({ error: 'Internal Server Error' })
  }
}
