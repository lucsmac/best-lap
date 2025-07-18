import { endOfDay, parseISO } from "date-fns";
import { MetricsRepository } from "@/data/repositories";
import { PerformanceAverageMetricsResponse } from "@/models/types";
import { MetricsOptions } from "@/api/http/controllers/channel-metrics/utils/metrics-schemas";
import { filterByAverageMetric } from "@/utils/filter-by-average-metrics";

type GetMetricsAverageParams = {
  period: 'hourly' | 'daily' | 'weekly'
  startDate?: string
  endDate?: string
  channel_id?: string
}

interface GetChannelAverageMetricsUseCaseRequest {
  metric?: MetricsOptions
  filterPeriodOptions: GetMetricsAverageParams
}

export class GetChannelAverageMetricsUseCase {
  constructor (private metricsRepository: MetricsRepository) {}
  
  async execute({ metric, filterPeriodOptions }: GetChannelAverageMetricsUseCaseRequest) {
    const metricsAverage = await this._getMetricsByPeriod(filterPeriodOptions)
  
    const allMetricsResponseData = metricsAverage as PerformanceAverageMetricsResponse[]

    if (!metric) return allMetricsResponseData
      
    const filteredMetricsData = filterByAverageMetric(metric, allMetricsResponseData)

    return filteredMetricsData
  }

  async _getMetricsByPeriod({ period, startDate = '2000-01-01', endDate, channel_id }: GetMetricsAverageParams) {
    if (!period || !channel_id) {
      return null
    }

    const dateTrunc = {
      hourly: 'hour',
      daily: 'day',
      weekly: 'week',
    }[period];
  
    const parsedStartDate = parseISO(startDate)
    const parsedEndDate = endDate ? endOfDay(parseISO(endDate)) : new Date()
    
    const queryParams = [dateTrunc, parsedStartDate, parsedEndDate, channel_id]
  
    const results = await this.metricsRepository.query(
      `
      SELECT
        DATE_TRUNC($1, time) AS period_start,
        AVG(score) AS avg_score,
        AVG("responseTime") AS avg_response_time,
        AVG(fcp) AS avg_fcp,
        AVG(si) AS avg_si,
        AVG(lcp) AS avg_lcp,
        AVG(tbt) AS avg_tbt,
        AVG(cls) AS avg_cls,
        MIN(score) AS min_score,
        MAX(score) AS max_score
      FROM metrics
      INNER JOIN channel c ON metrics.channel_id = c.id
      WHERE time BETWEEN $2 AND $3 AND c.id = $4
      GROUP BY
        DATE_TRUNC($1, time)
      ORDER BY
        period_start;
      `,
      queryParams
    );
  
    return results;
  }
}
