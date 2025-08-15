import { endOfDay, parseISO } from "date-fns";
import { MetricsRepository } from "../../modules";
import { PerformanceAverageMetricsResponse, PerformanceMetricEnum } from "../../types";
import { filterByAverageMetric } from "../../utils";

type GetMetricsAverageParams = {
  period: 'hourly' | 'daily' | 'weekly'
  startDate?: string
  endDate?: string
  page_id?: string
}

interface GetPageAverageMetricsUseCaseRequest {
  metric?: PerformanceMetricEnum
  filterPeriodOptions: GetMetricsAverageParams
}

export class GetPageAverageMetricsUseCase {
  constructor(private metricsRepository: MetricsRepository) { }

  async execute({ metric, filterPeriodOptions }: GetPageAverageMetricsUseCaseRequest) {
    const metricsAverage = await this._getMetricsByPeriod(filterPeriodOptions)

    const allMetricsResponseData = metricsAverage as PerformanceAverageMetricsResponse[]

    if (!metric) return allMetricsResponseData

    const filteredMetricsData = filterByAverageMetric(metric, allMetricsResponseData)

    return filteredMetricsData
  }

  async _getMetricsByPeriod({ period, startDate = '2000-01-01', endDate, page_id }: GetMetricsAverageParams) {
    if (!period || !page_id) {
      return null
    }

    const dateTrunc = {
      hourly: 'hour',
      daily: 'day',
      weekly: 'week',
    }[period];

    const parsedStartDate = parseISO(startDate)
    const parsedEndDate = endDate ? endOfDay(parseISO(endDate)) : new Date()

    const queryParams = [dateTrunc, page_id, parsedStartDate, parsedEndDate]

    const sourceTable = {
      daily: 'metrics_daily',
      weekly: 'metrics_weekly',
      hourly: 'metrics',
    }[period];

    const timeColumn = period === 'hourly' ? 'time' : 'bucket';

    const colsMetricsTable = {
      score: 'score',
      response_time: '"response_time"',
      fcp: 'fcp',
      si: 'si',
      lcp: 'lcp',
      tbt: 'tbt',
      cls: 'cls',
      seo: 'seo',
    }

    const colsAvgMetricsTable = {
      score: 'avg_score',
      response_time: '"avg_response_time"',
      fcp: 'avg_fcp',
      si: 'avg_si',
      lcp: 'avg_lcp',
      tbt: 'avg_tbt',
      cls: 'avg_cls',
      seo: 'avg_seo',
    }

    const tableColsMap = sourceTable === 'metrics' ? colsMetricsTable : colsAvgMetricsTable;

    const results = await this.metricsRepository.query(
      `
      SELECT
        DATE_TRUNC($1, ${timeColumn}) AS period_start,
        AVG(${tableColsMap.score}) AS avg_score,
        AVG(${tableColsMap.response_time}) AS avg_response_time,
        AVG(${tableColsMap.fcp}) AS avg_fcp,
        AVG(${tableColsMap.si}) AS avg_si,
        AVG(${tableColsMap.lcp}) AS avg_lcp,
        AVG(${tableColsMap.tbt}) AS avg_tbt,
        AVG(${tableColsMap.cls}) AS avg_cls,
        AVG(${tableColsMap.seo}) AS avg_seo
      FROM ${sourceTable} m
      INNER JOIN pages p ON m.page_id = $2
      WHERE ${timeColumn} BETWEEN $3 AND $4
      GROUP BY
        DATE_TRUNC($1, ${timeColumn})
      ORDER BY
        period_start;
      `,
      queryParams
    );

    return results;
  }
}
