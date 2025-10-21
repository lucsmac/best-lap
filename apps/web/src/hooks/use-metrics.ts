import { useQuery } from '@tanstack/react-query'
import { metricsApi } from '@/lib/api/endpoints'
import type { Period } from '@/types/api'

const METRICS_QUERY_KEY = 'metrics'

export function useRawMetrics(channelId: string | undefined) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'raw', channelId],
    queryFn: async () => {
      if (!channelId) throw new Error('Channel ID is required')
      const { data } = await metricsApi.getRawMetrics(channelId)
      return data
    },
    enabled: !!channelId,
  })
}

export function useChannelMetrics(
  channelId: string | undefined,
  period: Period
) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'channel', channelId, period],
    queryFn: async () => {
      if (!channelId) throw new Error('Channel ID is required')
      const { data } = await metricsApi.getChannelAverage(channelId, period)
      return data
    },
    enabled: !!channelId,
  })
}

export function useAllMetrics(period: Period) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'all', period],
    queryFn: async () => {
      const { data } = await metricsApi.getAllAverage(period)
      return data
    },
  })
}

export function useThemeMetrics(theme: string | undefined, period: Period) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'theme', theme, period],
    queryFn: async () => {
      if (!theme) throw new Error('Theme is required')
      const { data } = await metricsApi.getThemeAverage(theme, period)
      return data
    },
    enabled: !!theme,
  })
}
