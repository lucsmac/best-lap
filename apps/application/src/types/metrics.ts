export interface Metrics extends ChannelIdentifier, PerformanceMetrics {
  time: Date
}

type ChannelIdentifier = {
  channel_id: string,
}

type PerformanceMetrics = {
  score: number,
  responseTime: number,
  fcp: number,
  si: number,
  lcp: number,
  tbt: number,
  cls: number
}

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
