import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormMetricsRepository } from "@best-lap/infra";
import { GetChannelsAverageMetricsUseCase } from "@best-lap/core";
import { providerRequestParamsSchema } from "../utils/list-average-route-schemas";
import { querySchema } from "../utils/list-route-schemas";

export async function listAverageChannelsMetricsByProvider(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { metric, startDate, endDate } = querySchema.parse(request.query);
    const { period, provider_id } = providerRequestParamsSchema.parse(request.params);

    const metricsRepository = new TypeormMetricsRepository()
    const getChannelMetricsAverageUseCase = new GetChannelsAverageMetricsUseCase(metricsRepository)

    const metricsAverageData = await getChannelMetricsAverageUseCase.execute({
      metric,
      filterPeriodOptions: {
        period,
        endDate,
        startDate,
        providerId: provider_id,
        pagePath: '/'
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
