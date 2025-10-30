import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { metricsApi } from '@/lib/api/endpoints'
import type { Period } from '@/types/api'
import { toast } from '@/hooks/use-toast'

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
