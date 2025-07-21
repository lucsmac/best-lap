import { Metric, PerformanceMetricEnum, PerformanceMetricsResponse } from '../types';

export const filterByMetric = (metric: PerformanceMetricEnum, channelMetrics: Metric[] | PerformanceMetricsResponse[]): PerformanceMetricsResponse[] => {
  const filteredMetricsData = channelMetrics.map(metricData => {
    return {
      time: metricData.time,
      [metric]: metricData[metric]
    }
  })

  return filteredMetricsData
};
