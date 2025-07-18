import { MetricEntity, MetricEntityUnchecked } from '../entity/metric-entity.interface'
import { ChannelEntity } from '../../channel/entity/channel-entity.interface'

export interface MetricsRepository {
  create(params: MetricEntityUnchecked): Promise<void>
  listByChannel(channel: ChannelEntity): Promise<MetricEntity[]>
  query(query: string, parameters: unknown[]): Promise<unknown>
}
