import { PageEntity } from '../page/page-entity.interface'
import { MetricEntity, MetricEntityUnchecked } from './metric-entity.interface'

export interface MetricsRepository {
  create(params: MetricEntityUnchecked): Promise<void>
  listByPage(channel: PageEntity): Promise<MetricEntity[]>
  query(query: string, parameters: unknown[]): Promise<unknown>
}
