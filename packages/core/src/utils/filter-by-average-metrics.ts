import { PerformanceAverageMetricsResponse, PerformanceMetricEnum, PerformanceMetricsResponse } from "../types";

export const filterByAverageMetric = (metric: PerformanceMetricEnum, channelMetrics: PerformanceAverageMetricsResponse[]): PerformanceMetricsResponse[] => {
  const filteredMetricsData = channelMetrics.map(metricData => {
    return {
      time: metricData.period_start,
      [metric]: metricData[`avg_${metric === 'responseTime' ? 'response_time' : metric}`]
    }
  })

  return filteredMetricsData
};
