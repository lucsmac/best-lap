import { FastifyReply, FastifyRequest } from "fastify";
import { querySchema } from "./utils/list-route-schemas";
import { channelRequestParamsSchema } from "./utils/list-average-route-schemas";
import { TypeormMetricsRepository } from "@/data/repositories/typeorm";
import { GetChannelAverageMetricsUseCase } from "@/application/usecases";

export async function listAverageChannelMetrics(request: FastifyRequest, reply: FastifyReply) {
  try {
      const { metric, startDate, endDate } = querySchema.parse(request.query);
      const { period, channel_id } = channelRequestParamsSchema.parse(request.params);
      
      const metricsRepository = new TypeormMetricsRepository()
      const getChannelMetricsAverageUseCase = new GetChannelAverageMetricsUseCase(metricsRepository)
  
      const metricsAverageData = await getChannelMetricsAverageUseCase.execute({
        metric,
        filterPeriodOptions: {
          period,
          channel_id, 
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