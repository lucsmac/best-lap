import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query'
import { metricsApi } from '@/lib/api/endpoints'
import type { Period, AverageMetric } from '@/types/api'
import { toast } from '@/hooks/use-toast'
import { useMemo } from 'react'

const METRICS_QUERY_KEY = 'metrics'

export function useRawMetrics(channelId: string | undefined) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'raw', channelId],
    queryFn: async () => {
      if (!channelId) throw new Error('Channel ID is required')
      const { data } = await metricsApi.getRawMetrics(channelId)
      return data.metrics || []
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
      return data.metrics || []
    },
    enabled: !!channelId,
  })
}

export function useAllMetrics(period: Period) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'all', period],
    queryFn: async () => {
      const { data } = await metricsApi.getAllAverage(period)
      return data.metrics || []
    },
  })
}

export function useThemeMetrics(theme: string | undefined, period: Period) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'theme', theme, period],
    queryFn: async () => {
      if (!theme) throw new Error('Theme is required')
      const { data } = await metricsApi.getThemeAverage(theme, period)
      return data.metrics || []
    },
    enabled: !!theme,
  })
}

export function useProviderMetrics(providerId: string | undefined, period: Period) {
  return useQuery({
    queryKey: [METRICS_QUERY_KEY, 'provider', providerId, period],
    queryFn: async () => {
      if (!providerId) throw new Error('Provider ID is required')
      const { data } = await metricsApi.getProviderAverage(providerId, period)
      return data.metrics || []
    },
    enabled: !!providerId,
  })
}

// Hook to fetch metrics for multiple channels and aggregate them
export function useMultipleChannelsMetrics(channelIds: string[], period: Period) {
  const queries = useQueries({
    queries: channelIds.map((channelId) => ({
      queryKey: [METRICS_QUERY_KEY, 'channel', channelId, period],
      queryFn: async () => {
        const { data } = await metricsApi.getChannelAverage(channelId, period)
        return data.metrics || []
      },
      enabled: channelIds.length > 0,
    })),
  })

  const aggregatedMetrics = useMemo(() => {
    // Check if all queries are loaded
    const allLoaded = queries.every((q) => !q.isLoading)
    if (!allLoaded || queries.length === 0) return []

    // Get all metrics from all channels
    const allMetrics = queries.flatMap((q) => q.data || [])
    if (allMetrics.length === 0) return []

    // Group metrics by period_start
    const metricsByPeriod = new Map<string, AverageMetric[]>()
    allMetrics.forEach((metric) => {
      const existing = metricsByPeriod.get(metric.period_start) || []
      metricsByPeriod.set(metric.period_start, [...existing, metric])
    })

    // Aggregate metrics for each period
    const aggregated: AverageMetric[] = Array.from(metricsByPeriod.entries()).map(
      ([period_start, metrics]) => {
        const count = metrics.length
        return {
          period_start,
          avg_score: metrics.reduce((sum, m) => sum + m.avg_score, 0) / count,
          avg_seo: metrics.reduce((sum, m) => sum + m.avg_seo, 0) / count,
          avg_response_time:
            metrics.reduce((sum, m) => {
              const rt = typeof m.avg_response_time === 'string'
                ? parseFloat(m.avg_response_time)
                : m.avg_response_time
              return sum + rt
            }, 0) / count,
          avg_fcp: metrics.reduce((sum, m) => sum + m.avg_fcp, 0) / count,
          avg_si: metrics.reduce((sum, m) => sum + m.avg_si, 0) / count,
          avg_lcp: metrics.reduce((sum, m) => sum + m.avg_lcp, 0) / count,
          avg_tbt: metrics.reduce((sum, m) => sum + m.avg_tbt, 0) / count,
          avg_cls: metrics.reduce((sum, m) => sum + m.avg_cls, 0) / count,
        }
      }
    )

    // Sort by period_start
    return aggregated.sort((a, b) => a.period_start.localeCompare(b.period_start))
  }, [queries])

  return {
    data: aggregatedMetrics,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  }
}

// Mutation hooks for triggering metrics collection
export function useTriggerCollectionAll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await metricsApi.triggerCollectionAll()
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Coleta iniciada',
        description: `${data.jobs_count} jobs enfileirados para coleta`,
      })
      // Invalidate metrics after a delay to show new data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [METRICS_QUERY_KEY] })
      }, 5000)
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao disparar coleta',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    },
  })
}

export function useTriggerCollectionChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (channelId: string) => {
      const { data } = await metricsApi.triggerCollectionChannel(channelId)
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Coleta do canal iniciada',
        description: `${data.jobs_count} jobs enfileirados para coleta`,
      })
      // Invalidate metrics for this channel after a delay
      setTimeout(() => {
        if (data.channel_id) {
          queryClient.invalidateQueries({
            queryKey: [METRICS_QUERY_KEY, 'channel', data.channel_id]
          })
        }
      }, 5000)
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao disparar coleta do canal',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    },
  })
}

export function useTriggerCollectionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ channelId, pageId }: { channelId: string; pageId: string }) => {
      const { data } = await metricsApi.triggerCollectionPage(channelId, pageId)
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Coleta da página iniciada',
        description: 'Job enfileirado para coleta',
      })
      // Invalidate metrics for this page after a delay
      setTimeout(() => {
        if (data.channel_id) {
          queryClient.invalidateQueries({
            queryKey: [METRICS_QUERY_KEY, 'channel', data.channel_id]
          })
        }
      }, 5000)
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao disparar coleta da página',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    },
  })
}
