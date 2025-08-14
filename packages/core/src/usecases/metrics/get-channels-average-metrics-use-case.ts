import { endOfDay, parseISO } from "date-fns";
import { PerformanceAverageMetricsResponse, PerformanceMetricEnum } from "../../types";
import { MetricsRepository } from "../../modules";
import { filterByAverageMetric } from "../../utils";

type GetMetricsAverageParams = {
  period: 'hourly' | 'daily' | 'weekly'
  startDate?: string
  endDate?: string
  theme?: string
  pagePath?: string
}

interface GetChannelsAverageMetricsUseCaseRequest {
  metric?: PerformanceMetricEnum
  filterPeriodOptions: GetMetricsAverageParams
}

export class GetChannelsAverageMetricsUseCase {
  constructor(
    private metricsRepository: MetricsRepository
  ) { }

  async execute({ metric, filterPeriodOptions }: GetChannelsAverageMetricsUseCaseRequest) {
    const metricsAverage = await this._getMetricsByPeriod(filterPeriodOptions)

    const allMetricsResponseData = metricsAverage as PerformanceAverageMetricsResponse[]

    if (!metric) return allMetricsResponseData

    const filteredMetricsData = filterByAverageMetric(metric, allMetricsResponseData)

    return filteredMetricsData
  }

  async _getMetricsByPeriod({
    period,
    startDate = '2000-01-01',
    endDate,
    theme,
    pagePath,
  }: GetMetricsAverageParams) {
    if (!period) return null;

    const granularity = {
      hourly: 'hour',
      daily: 'day',
      weekly: 'week',
    }[period];

    if (!granularity) {
      throw new Error(`Invalid period: ${period}`);
    }

    const parsedStartDate = parseISO(startDate);
    const parsedEndDate = endDate ? endOfDay(parseISO(endDate)) : new Date();

    const whereConditions = ['time BETWEEN $1 AND $2'];
    const queryParams: any[] = [parsedStartDate, parsedEndDate];

    if (pagePath) {
      whereConditions.push('p.path = $3');
      queryParams.push(pagePath);
    }

    if (theme) {
      whereConditions.push(`c.theme = $${queryParams.length + 1}`);
      queryParams.push(theme);
    }

    const results = await this.metricsRepository.query(
      `
      SELECT
        DATE_TRUNC('${granularity}', time) AS period_start,
        AVG(score) AS avg_score,
        AVG("response_time") AS avg_response_time,
        AVG(fcp) AS avg_fcp,
        AVG(si) AS avg_si,
        AVG(lcp) AS avg_lcp,
        AVG(tbt) AS avg_tbt,
        AVG(cls) AS avg_cls,
        MIN(score) AS min_score,
        MAX(score) AS max_score
      FROM metrics
      ${theme || pagePath ? 'INNER JOIN pages p ON metrics.page_id = p.id' : ''}
      ${theme ? 'INNER JOIN channels c ON p.channel_id = c.id' : ''}
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY DATE_TRUNC('${granularity}', time)
      ORDER BY period_start;
      `,
      queryParams
    );

    return results;
  }
}
