import { api } from './client'
import type {
  Channel,
  CreateChannelInput,
  UpdateChannelInput,
  Page,
  CreatePageInput,
  UpdatePageInput,
  Metric,
  AverageMetric,
  Period,
} from '@/types/api'

// Channel endpoints
export const channelsApi = {
  getAll: () => api.get<Channel[]>('/channels'),

  getById: (channelId: string) => api.get<Channel>(`/channels/${channelId}`),

  getByTheme: (theme: string) => api.get<Channel[]>(`/channels/theme/${theme}`),

  create: (data: CreateChannelInput) => api.post<Channel>('/channels', data),

  update: (channelId: string, data: UpdateChannelInput) =>
    api.patch<Channel>(`/channels/${channelId}`, data),

  delete: (channelId: string) => api.delete(`/channels/${channelId}`),

  enable: (channelId: string) =>
    api.patch<Channel>(`/channels/${channelId}/enable`),

  disable: (channelId: string) =>
    api.patch<Channel>(`/channels/${channelId}/disable`),
}

// Page endpoints
export const pagesApi = {
  getByChannel: (channelId: string) =>
    api.get<Page[]>(`/${channelId}/pages`),

  create: (channelId: string, data: CreatePageInput) =>
    api.post<Page>(`/${channelId}/pages`, data),

  update: (channelId: string, pageId: string, data: UpdatePageInput) =>
    api.patch<Page>(`/${channelId}/pages/${pageId}`, data),

  delete: (channelId: string, pageId: string) =>
    api.delete(`/${channelId}/pages/${pageId}`),
}

// Metrics endpoints
export const metricsApi = {
  getRawMetrics: (channelId: string) =>
    api.get<Metric[]>(`/metrics/${channelId}`),

  getChannelAverage: (channelId: string, period: Period) =>
    api.get<AverageMetric[]>(`/metrics/${channelId}/average/${period}`),

  getAllAverage: (period: Period) =>
    api.get<AverageMetric[]>(`/metrics/average/${period}`),

  getThemeAverage: (theme: string, period: Period) =>
    api.get<AverageMetric[]>(`/metrics/theme/${theme}/average/${period}`),
}
