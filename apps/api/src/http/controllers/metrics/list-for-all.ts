import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormMetricsRepository } from "@best-lap/infra";
import { GetChannelsAverageMetricsUseCase } from "@best-lap/core";
import { querySchema, requestParamsSchema } from "./utils/list-all-route-schemas";

export async function listAverageForAllChannelsMetrics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { metric, startDate, endDate } = querySchema.parse(request.query);
    const { period } = requestParamsSchema.parse(request.params);

    const metricsRepository = new TypeormMetricsRepository()
    const getChannelMetricsAverageUseCase = new GetChannelsAverageMetricsUseCase(metricsRepository)

    const metricsAverageData = await getChannelMetricsAverageUseCase.execute({
      metric,
      filterPeriodOptions: {
        period,
        endDate,
        startDate
      }
    })

    return reply.code(200).send({
      metrics: metricsAverageData
    })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
