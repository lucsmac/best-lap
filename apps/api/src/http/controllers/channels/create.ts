import { FastifyReply, FastifyRequest } from "fastify";
import { ChannelAlreadyExists, CreateChannelUseCase } from '@best-lap/core'
import { createChannelBodySchema } from "./utils/create-route-schemas";
import { TypeormChannelsRepository } from "@best-lap/infra";

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

    await createChannelUseCase.execute({ domain, internal_link, is_reference, name, theme, active: false })

    return reply.code(201).send({ message: 'Channel created successfully.' })
  } catch (error) {
    console.error(error);

    if (error instanceof ChannelAlreadyExists) {
      return reply.status(409).send({ message: error.message })
    }

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
