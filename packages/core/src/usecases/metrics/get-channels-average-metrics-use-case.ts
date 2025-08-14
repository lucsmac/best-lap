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

    const sourceTable = {
      daily: 'metrics_daily',
      weekly: 'metrics_weekly',
      hourly: 'metrics',
    }[period];

    const timeColumn = period === 'hourly' ? 'time' : 'bucket';

    const whereConditions = [`${timeColumn} BETWEEN $1 AND $2`];
    const queryParams: any[] = [parsedStartDate, parsedEndDate];

    if (pagePath) {
      whereConditions.push('p.path = $' + (queryParams.length + 1));
      queryParams.push(pagePath);
    }

    if (theme) {
      whereConditions.push(`c.theme = $${queryParams.length + 1}`);
      queryParams.push(theme);
    }

    const colsMetricsTable = {
      score: 'score',
      response_time: '"response_time"',
      fcp: 'fcp',
      si: 'si',
      lcp: 'lcp',
      tbt: 'tbt',
      cls: 'cls',
    }

    const colsAvgMetricsTable = {
      score: 'avg_score',
      response_time: '"avg_response_time"',
      fcp: 'avg_fcp',
      si: 'avg_si',
      lcp: 'avg_lcp',
      tbt: 'avg_tbt',
      cls: 'avg_cls',
    }

    const tableColsMap = sourceTable === 'metrics' ? colsMetricsTable : colsAvgMetricsTable;

    const results = await this.metricsRepository.query(
      `
      SELECT
        DATE_TRUNC('${granularity}', ${timeColumn}) AS period_start,
        AVG(${tableColsMap.score}) AS avg_score,
        AVG(${tableColsMap.response_time}) AS avg_response_time,
        AVG(${tableColsMap.fcp}) AS avg_fcp,
        AVG(${tableColsMap.si}) AS avg_si,
        AVG(${tableColsMap.lcp}) AS avg_lcp,
        AVG(${tableColsMap.tbt}) AS avg_tbt,
        AVG(${tableColsMap.cls}) AS avg_cls
      FROM ${sourceTable} m
      ${theme || pagePath ? 'INNER JOIN pages p ON m.page_id = p.id' : ''}
      ${theme ? 'INNER JOIN channels c ON p.channel_id = c.id' : ''}
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY DATE_TRUNC('${granularity}', ${timeColumn})
      ORDER BY period_start;
      `,
      queryParams
    );

    return results;
  }
}
