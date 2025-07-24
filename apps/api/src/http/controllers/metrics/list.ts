import { FastifyReply, FastifyRequest } from "fastify";
import { querySchema, requestParamsSchema } from "./utils/list-route-schemas";
import { TypeormChannelsRepository, TypeormMetricsRepository } from "@best-lap/infra";
import { GetChannelMetricsUseCase, ResourceNotFound } from "@best-lap/core";

export async function listChannelMetrics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = requestParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository()
    const metricsRepository = new TypeormMetricsRepository()

    const getChannelMetricsUseCase = new GetChannelMetricsUseCase(channelsRepository, metricsRepository)
    const { metric, startDate, endDate } = querySchema.parse(request.query);

    const channelMetrics = await getChannelMetricsUseCase.execute(
      {
        channel_id,
        filterOptions: {
          endDate,
          startDate,
          metric
        }
      }
    )

    return reply.code(200).send(channelMetrics)
  } catch (error) {
    console.error(error)

    if (error instanceof ResourceNotFound) {
      return reply.code(404).send({ message: error.message })
    }

    return reply.code(500).send({ error: 'Internal Server Error' })
  }
}