import { ChannelEntity } from '../channel/channel-entity.interface'
import { MetricEntity, MetricEntityUnchecked } from './metric-entity.interface'

export interface MetricsRepository {
  create(params: MetricEntityUnchecked): Promise<void>
  listByChannel(channel: ChannelEntity): Promise<MetricEntity[]>
  query(query: string, parameters: unknown[]): Promise<unknown>
}
