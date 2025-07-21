import { ChannelsRepository, MetricsRepository } from "../modules";
import { ResourceNotFound } from "../errors";
import { PerformanceMetricEnum, PerformanceMetricsResponse } from "../types";
import { filterByDate, filterByMetric } from "../utils";

interface ChannelMetricsFilterOptions {
  metric?: PerformanceMetricEnum
  startDate?: string
  endDate?: string
}

interface GetChannelMetricsUseCaseRequest {
  channel_id: string
  filterOptions: ChannelMetricsFilterOptions
}

interface GetChannelMetricsUseCaseResponse {
  channel_url: string
  theme: string
  metrics: unknown
}

export class GetChannelMetricsUseCase {
  constructor(
    private channelsRepository: ChannelsRepository,
    private metricsRepository: MetricsRepository
  ) { }

  async execute({ channel_id, filterOptions }: GetChannelMetricsUseCaseRequest): Promise<GetChannelMetricsUseCaseResponse> {
    const channel = await this.channelsRepository.findById(channel_id)

    if (!channel) {
      throw new ResourceNotFound()
    }

    const channelMetrics = await this.metricsRepository.listByChannel(channel)

    const { metric, startDate, endDate } = filterOptions;

    let channelMetricsData: PerformanceMetricsResponse[] = channelMetrics;

    if (startDate || endDate) {
      channelMetricsData = filterByDate({ startDate, endDate }, channelMetricsData)
    }

    if (metric) {
      channelMetricsData = filterByMetric(metric, channelMetricsData)
    }

    return {
      channel_url: channel.internal_link,
      theme: channel.theme,
      metrics: channelMetricsData
    }
  }
}
