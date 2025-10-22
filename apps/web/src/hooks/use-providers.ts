import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '@/lib/api/endpoints'
import type { CreateProviderInput, UpdateProviderInput } from '@/types/api'

const PROVIDERS_QUERY_KEY = 'providers'

export function useProviders() {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await providersApi.getAll()
      return data.providers || []
    },
  })
}

export function useProvider(providerId: string | undefined) {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY, providerId],
    queryFn: async () => {
      if (!providerId) throw new Error('Provider ID is required')
      const { data } = await providersApi.getById(providerId)
      return data.provider
    },
    enabled: !!providerId,
  })
}

export function useCreateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProviderInput) => providersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_QUERY_KEY] })
    },
  })
}

export function useUpdateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      providerId,
      data,
    }: {
      providerId: string
      data: UpdateProviderInput
    }) => providersApi.update(providerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PROVIDERS_QUERY_KEY, variables.providerId],
      })
    },
  })
}

export function useDeleteProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (providerId: string) => providersApi.delete(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_QUERY_KEY] })
    },
  })
}
