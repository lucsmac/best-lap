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
  getAll: () =>
    api.get<{ channels_count: number; channels: Channel[] }>('/channels'),

  getById: (channelId: string) =>
    api.get<{ channel: Channel }>(`/channels/${channelId}`),

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
    api.get<{ pages: Page[] }>(`/channels/${channelId}/pages`),

  create: (channelId: string, data: CreatePageInput) =>
    api.post<Page>(`/channels/${channelId}/pages`, data),

  update: (channelId: string, pageId: string, data: UpdatePageInput) =>
    api.patch<Page>(`/channels/${channelId}/pages/${pageId}`, data),

  delete: (channelId: string, pageId: string) =>
    api.delete(`/channels/${channelId}/pages/${pageId}`),
}

// Metrics endpoints
export const metricsApi = {
  getRawMetrics: (channelId: string) =>
    api.get<{ metrics: Metric[] }>(`/channels/metrics/${channelId}`),

  getChannelAverage: (channelId: string, period: Period) =>
    api.get<{ metrics: AverageMetric[] }>(
      `/channels/metrics/${channelId}/average/${period}`
    ),

  getAllAverage: (period: Period) =>
    api.get<{ metrics: AverageMetric[] }>(
      `/channels/metrics/average/${period}`
    ),

  getThemeAverage: (theme: string, period: Period) =>
    api.get<{ metrics: AverageMetric[] }>(
      `/channels/metrics/theme/${theme}/average/${period}`
    ),
}
