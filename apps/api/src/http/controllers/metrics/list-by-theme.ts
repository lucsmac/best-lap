import { FastifyReply, FastifyRequest } from "fastify";
import { querySchema, themeRequestParamsSchema } from "./utils/list-route-schemas";
import { TypeormMetricsRepository } from "@/data/repositories/typeorm";
import { GetChannelsAverageMetricsUseCase } from "@/application/usecases";

export async function listAverageChannelsMetricsByTheme(request: FastifyRequest, reply: FastifyReply) {
  try {
      const { metric, startDate, endDate } = querySchema.parse(request.query);
      const { period, theme } = themeRequestParamsSchema.parse(request.params);
      
      const metricsRepository = new TypeormMetricsRepository()
      const getChannelMetricsAverageUseCase = new GetChannelsAverageMetricsUseCase(metricsRepository)
  
      const metricsAverageData = await getChannelMetricsAverageUseCase.execute({
        metric,
        filterPeriodOptions: {
          period,
          endDate,
          startDate,
          theme
        }
      })
      
      return reply.code(200).send({
        metrics: metricsAverageData
      })
  } catch (error) {
    console.error(error);
    
    return reply.code(500).send({ error: 'Internal Server Error.'})
  }
}
