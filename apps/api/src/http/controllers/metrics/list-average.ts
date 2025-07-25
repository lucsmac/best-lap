import { FastifyReply, FastifyRequest } from "fastify";
import { querySchema } from "./utils/list-route-schemas";
import { TypeormMetricsRepository, TypeormPagesRepository } from "@best-lap/infra";
import { GetPageAverageMetricsUseCase } from "@best-lap/core";
import { channelRequestParamsSchema } from "./utils/list-average-route-schemas";

export async function listAverageChannelMetrics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { metric, startDate, endDate } = querySchema.parse(request.query);
    const { period, channel_id } = channelRequestParamsSchema.parse(request.params);

    const pagesRepository = new TypeormPagesRepository()
    const page = await pagesRepository.findByPathFromChannelId({
      channel_id,
      path: '/'
    })

    if (!page) {
      return reply.code(404).send({ error: 'Page not found' });
    }

    const metricsRepository = new TypeormMetricsRepository()
    const getChannelMetricsAverageUseCase = new GetPageAverageMetricsUseCase(metricsRepository)

    const metricsAverageData = await getChannelMetricsAverageUseCase.execute({
      metric,
      filterPeriodOptions: {
        period,
        page_id: page.id,
        endDate,
        startDate
      }
    })

    return reply.code(200).send({
      metrics: metricsAverageData
    })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error' })
  }
}