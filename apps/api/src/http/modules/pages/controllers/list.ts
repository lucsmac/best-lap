import { TypeormChannelsRepository, TypeormPagesRepository } from "@best-lap/infra";
import { FastifyReply, FastifyRequest } from "fastify";
import { listPagesRequestParamsSchema } from "../schemas/list";

export async function listPages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = listPagesRequestParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository()
    const channel = await channelsRepository.findById(channel_id)

    if (!channel) return reply.code(400).send({ error: "Channel doens't exists" })

    const pagesRepository = new TypeormPagesRepository()
    const pagesList = await pagesRepository.listAllByChannel(channel_id)

    return reply.code(200).send({ pages_count: pagesList.length, pages: pagesList })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
