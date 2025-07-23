import {
  MetricEntity,
  MetricEntityUnchecked,
  MetricsRepository,
  PageEntity
} from "@best-lap/core";
import { Metric as MetricModel } from '../entities/metric-entity';
import { dataSource } from "../../database/data-source";

const metricsRepository = dataSource.getRepository<MetricModel>(MetricModel);

export class TypeormMetricsRepository implements MetricsRepository {
  async create(params: MetricEntityUnchecked): Promise<void> {
    const metricsData = metricsRepository.create(params)
    await metricsRepository.save(metricsData)
  }

  async listByPage(page: PageEntity): Promise<MetricEntity[]> {
    const pageMetrics = await metricsRepository.find({
      where: {
        page
      }
    })

    return pageMetrics
  }

  async query(query: string, parameters: unknown[]): Promise<unknown> {
    const result = await metricsRepository.query(query, parameters)

    return result
  }
}
