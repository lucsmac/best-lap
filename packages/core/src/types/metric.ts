export interface Metric extends ChannelIdentifier, PerformanceMetrics {
  time: Date
}

type ChannelIdentifier = {
  channel_id: string,
}

export type PerformanceMetrics = {
  score: number,
  response_time: number,
  fcp: number,
  si: number,
  lcp: number,
  tbt: number,
  cls: number,
  seo: number
}

export const PerformanceMetricEnum = {
  score: 'score',
  response_time: 'response_time',
  fcp: 'fcp',
  si: 'si',
  lcp: 'lcp',
  tbt: 'tbt',
  cls: 'cls',
  seo: 'seo',
} as const;

export type PerformanceMetricEnum = keyof typeof PerformanceMetricEnum;

export type PerformanceMetricsResponse = {
  time: Date,
  score?: number,
  response_time?: number,
  fcp?: number,
  si?: number,
  lcp?: number,
  tbt?: number,
  cls?: number,
  seo?: number
}

export type PerformanceAverageMetricsResponse = {
  period_start: Date,
  avg_score?: number,
  avg_response_time?: number,
  avg_fcp?: number,
  avg_si?: number,
  avg_lcp?: number,
  avg_tbt?: number,
  avg_cls?: number,
  avg_seo?: number
}
