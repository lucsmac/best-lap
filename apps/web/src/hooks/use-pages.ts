import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pagesApi } from '@/lib/api/endpoints'
import type { CreatePageInput, UpdatePageInput } from '@/types/api'

const PAGES_QUERY_KEY = 'pages'

export function usePages(channelId: string | undefined) {
  return useQuery({
    queryKey: [PAGES_QUERY_KEY, channelId],
    queryFn: async () => {
      if (!channelId) throw new Error('Channel ID is required')
      const { data } = await pagesApi.getByChannel(channelId)
      return data.pages || []
    },
    enabled: !!channelId,
  })
}

export function useCreatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      channelId,
      data,
    }: {
      channelId: string
      data: CreatePageInput
    }) => pagesApi.create(channelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PAGES_QUERY_KEY, variables.channelId],
      })
    },
  })
}

export function useUpdatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      channelId,
      pageId,
      data,
    }: {
      channelId: string
      pageId: string
      data: UpdatePageInput
    }) => pagesApi.update(channelId, pageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PAGES_QUERY_KEY, variables.channelId],
      })
    },
  })
}

export function useDeletePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      channelId,
      pageId,
    }: {
      channelId: string
      pageId: string
    }) => pagesApi.delete(channelId, pageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PAGES_QUERY_KEY, variables.channelId],
      })
    },
  })
}
