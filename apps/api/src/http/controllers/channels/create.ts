import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm";
import { CreateChannelUseCase } from "@/application/usecases";
import { createChannelBodySchema } from "./utils/create-route-schemas";
import { ChannelAlreadyExists } from "@/models/errors";
import { AddJobOnCreateChannel } from "@/application/services";

export async function createChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const {
      domain,
      internal_link,
      is_reference,
      name,
      theme
    } = createChannelBodySchema.parse(request.body)

    const channelsRepository = new TypeormChannelsRepository()
    const createChannelUseCase = new CreateChannelUseCase(channelsRepository)
    
    const createdChannel = await createChannelUseCase.execute({ domain, internal_link, is_reference, name, theme})

    const addJobOnCreateChannel = new AddJobOnCreateChannel(channelsRepository)
    addJobOnCreateChannel.execute(createdChannel)

    return reply.code(201).send()
  } catch(error) {
    console.error(error);
    
    if (error instanceof ChannelAlreadyExists) {
      return reply.status(409).send({ message: error.message })
    }
    
    return reply.code(500).send({ error: 'Internal Server Error.'})
  }
}
