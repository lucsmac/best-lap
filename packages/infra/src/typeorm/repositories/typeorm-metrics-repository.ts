import {
  ChannelEntity,
  MetricEntity,
  MetricEntityUnchecked,
  MetricsRepository
} from "@best-lap/core";
import { Metric as MetricModel } from '../entities/metric-entity';
import { dataSource } from "../../database/data-source";

const metricsRepository = dataSource.getRepository<MetricModel>(MetricModel);

export class TypeormMetricsRepository implements MetricsRepository {
  async create(params: MetricEntityUnchecked): Promise<void> {
    const metricsData = metricsRepository.create(params)
    await metricsRepository.save(metricsData)
  }

  async listByChannel(channel: ChannelEntity): Promise<MetricEntity[]> {
    const channelMetrics = await metricsRepository.find({
      where: {
        channel
      }
    })

    return channelMetrics
  }

  async query(query: string, parameters: unknown[]): Promise<unknown> {
    const result = await metricsRepository.query(query, parameters)

    return result
  }
}
