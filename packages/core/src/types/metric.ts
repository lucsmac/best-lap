export interface Metric extends ChannelIdentifier, PerformanceMetrics {
  time: Date
}

type ChannelIdentifier = {
  channel_id: string,
}

export type PerformanceMetrics = {
  score: number,
  responseTime: number,
  fcp: number,
  si: number,
  lcp: number,
  tbt: number,
  cls: number
}

export const PerformanceMetricEnum = {
  score: 'score',
  responseTime: 'responseTime',
  fcp: 'fcp',
  si: 'si',
  lcp: 'lcp',
  tbt: 'tbt',
  cls: 'cls',
} as const;

export type PerformanceMetricEnum = keyof typeof PerformanceMetricEnum;

export type PerformanceMetricsResponse = {
  time: Date,
  score?: number,
  responseTime?: number,
  fcp?: number,
  si?: number,
  lcp?: number,
  tbt?: number,
  cls?: number
}

export type PerformanceAverageMetricsResponse = {
  period_start: Date,
  avg_score?: number,
  avg_response_time?: number,
  avg_fcp?: number,
  avg_si?: number,
  avg_lcp?: number,
  avg_tbt?: number,
  avg_cls?: number
}
