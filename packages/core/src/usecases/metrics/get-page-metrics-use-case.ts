import { ChannelEntity, ChannelsRepository, MetricsRepository, PageRepository } from "../../modules";
import { ResourceNotFound } from "../../errors";
import { PerformanceMetricEnum, PerformanceMetricsResponse } from "../../types";
import { filterByDate, filterByMetric } from "../../utils";

interface PageMetricsFilterOptions {
  metric?: PerformanceMetricEnum
  startDate?: string
  endDate?: string
}

interface GetPageMetricsUseCaseRequest {
  pageId: string
  filterOptions: PageMetricsFilterOptions
}

interface GetPageMetricsUseCaseResponse {
  page_url: string
  theme: string
  metrics: unknown
}

export class GetPageMetricsUseCase {
  constructor(
    private channelsRepository: ChannelsRepository,
    private pagesRepository: PageRepository,
    private metricsRepository: MetricsRepository
  ) { }

  async execute({ pageId, filterOptions }: GetPageMetricsUseCaseRequest): Promise<GetPageMetricsUseCaseResponse> {
    const page = await this.pagesRepository.findById(pageId)

    if (!page) {
      throw new ResourceNotFound()
    }

    const pageMetrics = await this.metricsRepository.listByPage(page)
    const pageChannel = await this.channelsRepository.findById(page.channel_id) as ChannelEntity

    const { metric, startDate, endDate } = filterOptions;

    let pageMetricsData: PerformanceMetricsResponse[] = pageMetrics;

    if (startDate || endDate) {
      pageMetricsData = filterByDate({ startDate, endDate }, pageMetricsData)
    }

    if (metric) {
      pageMetricsData = filterByMetric(metric, pageMetricsData)
    }

    return {
      page_url: `${pageChannel.internal_link}${page.path}`,
      theme: pageChannel.theme,
      metrics: pageMetricsData
    }
  }
}
